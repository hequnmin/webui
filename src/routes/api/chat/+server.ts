import type { RequestHandler } from "./$types";
import { env } from "$env/dynamic/private";

// 请求体类型
type ChatRequest = {
  query?: string;
};

// AI接口返回类型（只关心用到的部分）
type AIResponse = {
  data?: {
    generated_answer?: string;
    reasoning_content?: string;
  };
};

export const POST: RequestHandler = async ({ request }) => {
  const knowledgeBaseURL = env.KNOWLEDGEBASE_URL;
  const apiKey = env.API_KEY;
  const serviceId = env.SERVICE_RESOURCE_ID;

  try {
    // 1. 解析请求体
    const body: ChatRequest = await request.json();
    const query = body?.query;

    if (!query) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "query 不能为空",
        }),
        { status: 400 },
      );
    }

    // 2. 构造请求参数
    const requestParams = {
      service_resource_id: serviceId,
      messages: [
        {
          role: "user",
          content: [
            {
              text: query,
              type: "text",
            },
          ],
        },
      ],
      stream: false,
    };

    // 3. 调用外部 API
    const response = await fetch(
      `${knowledgeBaseURL}/api/knowledge/service/chat`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestParams),
      },
    );

    const result: AIResponse = await response.json();

    // 4. 提取结果
    const generatedAnswer = result?.data?.generated_answer ?? ""; //LLM 模型生成的回答

    // 5. 返回前端
    return new Response(
      JSON.stringify({
        success: true,
        answer: generatedAnswer,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (err) {
    console.error(err);

    return new Response(
      JSON.stringify({
        success: false,
        message: "服务器错误",
      }),
      { status: 500 },
    );
  }
};
