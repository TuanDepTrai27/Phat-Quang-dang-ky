/**
 * Đặc tả REST API theo chuẩn OpenAPI 3.0.
 * Xem dạng JSON tại /api/v1/openapi.json, dạng trang đọc tại /tai-lieu-api.
 * Dán JSON vào https://editor.swagger.io để xem giao diện Swagger.
 */

const errorSchema = {
  type: "object",
  required: ["error"],
  properties: {
    error: {
      type: "object",
      required: ["code", "message"],
      properties: {
        code: { type: "string", example: "EVENT_FULL" },
        message: { type: "string", example: "Sự kiện đã hết chỗ." },
        fields: {
          type: "object",
          additionalProperties: { type: "string" },
          description: "Chỉ có khi code = VALIDATION_ERROR: lỗi của từng trường",
          example: { phone: "Số điện thoại chưa đúng. Ví dụ: 0912345678." },
        },
      },
    },
  },
} as const;

const err = (description: string) => ({
  description,
  content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
});

const codePhoneBody = {
  required: true,
  content: {
    "application/json": {
      schema: {
        type: "object",
        required: ["code", "phone"],
        properties: {
          code: { type: "string", pattern: "^PQ-[A-Z0-9]{6}$", example: "PQ-7K3M9X" },
          phone: { type: "string", example: "0912345678", description: "Chấp nhận +84…, 84…, có dấu cách/chấm" },
        },
      },
    },
  },
};

export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "API đăng ký khóa tu – Thiền Tôn Phật Quang",
    version: "1.0.0",
    description:
      "API công khai cho người đăng ký: xem sự kiện, đăng ký, tra cứu và hủy. " +
      "Không cần đăng nhập. Mọi thao tác ghi đều đi qua hàm PostgreSQL SECURITY DEFINER và Row Level Security. " +
      "Kết quả thành công nằm trong trường `data`, lỗi nằm trong trường `error`.",
  },
  servers: [{ url: "/", description: "Máy chủ hiện tại" }],
  tags: [
    { name: "Sự kiện", description: "Lịch khóa tu, đại lễ" },
    { name: "Đăng ký", description: "Đăng ký, tra cứu, hủy" },
  ],
  paths: {
    "/api/v1/events": {
      get: {
        tags: ["Sự kiện"],
        summary: "Danh sách sự kiện đã công khai",
        parameters: [
          {
            name: "type",
            in: "query",
            schema: { type: "string", enum: ["khoa_thien", "dai_le", "quy_y", "thuyet_giang", "khac"] },
          },
          {
            name: "upcoming",
            in: "query",
            description: "true: chỉ lấy sự kiện chưa kết thúc",
            schema: { type: "string", enum: ["true", "false"] },
          },
        ],
        responses: {
          "200": {
            description: "Thành công",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { data: { type: "array", items: { $ref: "#/components/schemas/Event" } } },
                },
              },
            },
          },
          "400": err("Tham số type không hợp lệ"),
        },
      },
    },
    "/api/v1/events/{slug}": {
      get: {
        tags: ["Sự kiện"],
        summary: "Chi tiết một sự kiện",
        parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" }, example: "dai-le-phat-dan-2027" }],
        responses: {
          "200": {
            description: "Thành công",
            content: {
              "application/json": {
                schema: { type: "object", properties: { data: { $ref: "#/components/schemas/Event" } } },
              },
            },
          },
          "404": err("Không có sự kiện (EVENT_NOT_FOUND)"),
        },
      },
    },
    "/api/v1/registrations": {
      post: {
        tags: ["Đăng ký"],
        summary: "Đăng ký tham dự sự kiện",
        description:
          "Hàm register_for_event khóa dòng sự kiện (SELECT … FOR UPDATE) nên nhiều người đăng ký cùng lúc không vượt quá số chỗ. " +
          "Trùng họ tên + số điện thoại trong cùng sự kiện sẽ bị từ chối.",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/RegistrationInput" } } },
        },
        responses: {
          "201": {
            description: "Đã đăng ký, trạng thái chờ duyệt",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "object",
                      properties: {
                        code: { type: "string", example: "PQ-7K3M9X" },
                        event_id: { type: "string", format: "uuid" },
                      },
                    },
                  },
                },
              },
            },
          },
          "400": err("VALIDATION_ERROR (kèm fields) hoặc BAD_REQUEST (không phải JSON)"),
          "404": err("EVENT_NOT_FOUND"),
          "409": err("EVENT_FULL, ALREADY_REGISTERED hoặc REGISTRATION_CLOSED"),
          "500": err("INTERNAL_ERROR"),
        },
      },
    },
    "/api/v1/registrations/lookup": {
      post: {
        tags: ["Đăng ký"],
        summary: "Tra cứu đăng ký bằng mã + số điện thoại",
        description: "Dùng POST để số điện thoại không nằm trên URL.",
        requestBody: codePhoneBody,
        responses: {
          "200": {
            description: "Thành công",
            content: {
              "application/json": {
                schema: { type: "object", properties: { data: { $ref: "#/components/schemas/Lookup" } } },
              },
            },
          },
          "400": err("VALIDATION_ERROR"),
          "404": err("REGISTRATION_NOT_FOUND"),
        },
      },
    },
    "/api/v1/registrations/cancel": {
      post: {
        tags: ["Đăng ký"],
        summary: "Người đăng ký tự hủy",
        description: "Chỉ hủy được đăng ký đang chờ duyệt hoặc đã duyệt. Chỗ được nhả cho người khác.",
        requestBody: codePhoneBody,
        responses: {
          "200": {
            description: "Đã hủy",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "object",
                      properties: { code: { type: "string" }, status: { type: "string", example: "cancelled" } },
                    },
                  },
                },
              },
            },
          },
          "400": err("VALIDATION_ERROR"),
          "404": err("REGISTRATION_NOT_FOUND"),
        },
      },
    },
  },
  components: {
    schemas: {
      Error: errorSchema,
      Event: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          slug: { type: "string", example: "dai-le-phat-dan-2027" },
          title: { type: "string", example: "Đại lễ Phật Đản" },
          event_type: { type: "string", enum: ["khoa_thien", "dai_le", "quy_y", "thuyet_giang", "khac"] },
          description: { type: "string", nullable: true },
          cover_url: { type: "string", nullable: true },
          venue_name: { type: "string", nullable: true },
          venue_address: { type: "string", nullable: true },
          map_url: { type: "string", nullable: true },
          start_date: { type: "string", format: "date" },
          end_date: { type: "string", format: "date" },
          lunar_text: { type: "string", nullable: true, example: "14–15/4 AL" },
          capacity: { type: "integer", nullable: true, description: "null = không giới hạn" },
          registration_open: { type: "boolean" },
          taken: { type: "integer", description: "Số đăng ký chờ duyệt + đã duyệt" },
          seats_left: { type: "integer", nullable: true },
          state: { type: "string", enum: ["open", "full", "closed", "past"] },
        },
      },
      RegistrationInput: {
        type: "object",
        required: ["event_id", "full_name", "phone", "birth_year", "gender"],
        properties: {
          event_id: { type: "string", format: "uuid" },
          full_name: { type: "string", minLength: 2, maxLength: 100, example: "Nguyễn Văn An" },
          dharma_name: { type: "string", maxLength: 100, example: "Minh Tâm" },
          phone: { type: "string", example: "0912345678" },
          birth_year: { type: "integer", minimum: 1900, example: 1985 },
          gender: { type: "string", enum: ["nam", "nu"] },
          province: { type: "string", maxLength: 100, example: "TP. Hồ Chí Minh" },
          is_first_time: { type: "boolean", default: false },
          needs_lodging: { type: "boolean", default: false },
          notes: { type: "string", maxLength: 500 },
        },
      },
      Lookup: {
        type: "object",
        properties: {
          code: { type: "string" },
          full_name: { type: "string" },
          status: { type: "string", enum: ["pending", "approved", "rejected", "cancelled"] },
          status_label: { type: "string", example: "Chờ duyệt" },
          event: {
            type: "object",
            properties: {
              title: { type: "string" },
              slug: { type: "string" },
              start_date: { type: "string", format: "date" },
              end_date: { type: "string", format: "date" },
              venue_name: { type: "string", nullable: true },
            },
          },
        },
      },
    },
  },
} as const;
