import crypto from "crypto";
import iconv from "iconv-lite";

/**
 * 复现 ATE2020 的 DES 加密逻辑。
 * C# 代码中变量名与属性赋值是反的：
 * - iv 数组 [102,16,93,156,78,4,218,32] 被赋给 Key
 * - key 数组 [55,103,246,79,36,99,167,3] 被赋给 IV
 * 编码使用 Encoding.Default，在中文 Windows 下为 GBK。
 */
const DES_KEY = Buffer.from([102, 16, 93, 156, 78, 4, 218, 32]);
const DES_IV = Buffer.from([55, 103, 246, 79, 36, 99, 167, 3]);

export function encryptPassword(plaintext: string): string {
  const input = iconv.encode(plaintext, "gbk");
  const cipher = crypto.createCipheriv("des-cbc", DES_KEY, DES_IV);
  const encrypted = Buffer.concat([cipher.update(input), cipher.final()]);
  return encrypted.toString("base64");
}

export function decryptPassword(ciphertext: string): string {
  if (!ciphertext) return "";
  try {
    const input = Buffer.from(ciphertext, "base64");
    const decipher = crypto.createDecipheriv("des-cbc", DES_KEY, DES_IV);
    const decrypted = Buffer.concat([
      decipher.update(input),
      decipher.final(),
    ]);
    return iconv.decode(decrypted, "gbk");
  } catch {
    return "";
  }
}
