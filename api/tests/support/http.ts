export type ErrorResponse = {
  status: number;
  data: { message: string };
};

export function getErrorResponse(error: {
  response: ErrorResponse;
}): ErrorResponse {
  return error.response;
}
