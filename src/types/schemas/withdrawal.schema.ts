import {z} from "zod";
import {MAX_IMAGE_SIZE_BYTES} from "@/types/activity.type";

function crc16Ccitt(data: string): string {
    let crc = 0xffff;
    for (let i = 0; i < data.length; i++) {
        crc ^= data.charCodeAt(i) << 8;
        for (let j = 0; j < 8; j++) {
            crc = (crc & 0x8000) !== 0 ? (crc << 1) ^ 0x1021 : crc << 1;
            crc &= 0xffff;
        }
    }
    return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function isValidKhqrString(value: string): boolean {
    if (!value.startsWith("000201")) return false;

    const crcTagIndex = value.length - 8;
    if (value.slice(crcTagIndex, crcTagIndex + 4) !== "6304") return false;

    const payload = value.slice(0, crcTagIndex + 4);
    const providedCrc = value.slice(crcTagIndex + 4);
    return crc16Ccitt(payload) === providedCrc.toUpperCase();
}

export function buildWithdrawalRequestSchema(maxAmount: number) {
    return z.object({
        amount: z
            .string()
            .min(1, "Please enter an amount")
            .refine((val) => !Number.isNaN(Number(val)), "Please enter a valid amount")
            .refine((val) => Number(val) >= 1, "Amount must be at least $1")
            .refine(
                (val) => Number(val) <= Math.min(10000, maxAmount),
                maxAmount < 1
                    ? "Insufficient wallet balance"
                    : `Amount must be no more than $${Math.min(10000, maxAmount).toLocaleString()}`,
            ),
        qrString: z
            .string()
            .min(1, "Could not detect a QR code in this image")
            .refine(isValidKhqrString, "This doesn't look like a valid KHQR payment code"),
    });
}

export type WithdrawalRequestFormValues = z.infer<
    ReturnType<typeof buildWithdrawalRequestSchema>
>;

export const ACCEPTED_WITHDRAW_DOC = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
    "application/pdf"
];

export const approveWithdrawalSchema = z.object({
    transactionRef: z
        .string()
        .trim()
        .min(1, "Please enter the bank transaction reference")
        .max(255, "Transaction reference is too long"),
    proof: z
        .instanceof(File)
        .optional()
        .refine((file) => file !== undefined, "Please upload proof of the transfer (receipt or screenshot)")
        .refine((file) => !file || ACCEPTED_WITHDRAW_DOC.includes(file.type), "Please upload a valid image (JPG, PNG, WEBP, HEIC) or PDF file.")
        .refine((file) => !file || file.size <= MAX_IMAGE_SIZE_BYTES, "File must be smaller than 5MB."),
});

export type ApproveWithdrawalFormValues = z.infer<typeof approveWithdrawalSchema>;
