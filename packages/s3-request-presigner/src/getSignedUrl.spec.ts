const mockV4Sign = jest.fn();
const mockV4Presign = jest.fn();
const mockV4 = jest.fn().mockReturnValue({
  presign: mockV4Presign,
  sign: mockV4Sign,
});
jest.mock("@aws-sdk/signature-v4", () => ({
  SignatureV4: mockV4,
}));

import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";

const mockPresign = jest.fn();
const mockPresigner = jest.fn().mockReturnValue({
  presign: mockPresign,
});
jest.mock("./presigner", () => ({
  S3RequestPresigner: mockPresigner,
}));
jest.mock("@aws-sdk/util-format-url", () => ({
  formatUrl: (url: any) => url,
}));

import { RequestPresigningArguments } from "@aws-sdk/types/src";

import { getSignedUrl } from "./getSignedUrl";

describe("getSignedUrl", () => {
  const clientParams = { region: "us-foo-1" };

  beforeEach(() => {
    mockPresign.mockReset();
  });

  it("should call S3Presigner.sign", async () => {
    const mockPresigned = "a presigned url";
    mockPresign.mockReturnValue(mockPresigned);
    const client = new S3Client(clientParams);
    const command = new GetObjectCommand({
      Bucket: "Bucket",
      Key: "Key",
    });
    const signed = await getSignedUrl(client, command);
    expect(signed).toBe(mockPresigned);
    expect(mockPresign).toBeCalled();
    expect(mockV4Presign).not.toBeCalled();
    expect(mockV4Sign).not.toBeCalled();
    // do not add extra middleware to the client or command
    expect(client.middlewareStack.remove("presignInterceptMiddleware")).toBe(false);
    expect(command.middlewareStack.remove("presignInterceptMiddleware")).toBe(false);
  });

  it("should presign with signing region and service in context if exists", async () => {
    const mockPresigned = "a presigned url";
    mockPresign.mockReturnValue(mockPresigned);
    const signingRegion = "aws-foo-1";
    const signingService = "bar";
    const client = new S3Client(clientParams);
    client.middlewareStack.addRelativeTo(
      (next: any, context: any) => (args: any) => {
        context["signing_region"] = signingRegion;
        context["signing_service"] = signingService;
        return next(args);
      },
      {
        relation: "before",
        toMiddleware: "presignInterceptMiddleware",
      }
    );
    const command = new GetObjectCommand({
      Bucket: "Bucket",
      Key: "Key",
    });
    await getSignedUrl(client, command);
    expect(mockPresign).toBeCalled();
    expect(mockPresign.mock.calls[0][1]).toMatchObject({
      signingRegion,
      signingService,
    });
  });

  it("should presign with parameters from presign options if set", async () => {
    const mockPresigned = "a presigned url";
    mockPresign.mockReturnValue(mockPresigned);
    const options: RequestPresigningArguments = {
      signingRegion: "aws-foo-1",
      signingService: "bar",
      expiresIn: 900,
      signingDate: new Date(),
      signableHeaders: new Set(["head-1", "head-2"]),
      unsignableHeaders: new Set(["head-3", "head-4"]),
    };
    const client = new S3Client(clientParams);
    const command = new GetObjectCommand({
      Bucket: "Bucket",
      Key: "Key",
    });
    await getSignedUrl(client, command, options);
    expect(mockPresign).toBeCalled();
    expect(mockPresign.mock.calls[0][1]).toMatchObject(options);
  });
});
