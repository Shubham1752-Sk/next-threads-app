import * as z from "zod";

export const threadValidation=z.object({
    thread: z.string().url().nonempty().min(3,{message: "Minimum 3 characters are required"}),
    accountId:z.string(),
})

export const commentValidation=z.object({
    thread: z.string().url().nonempty().min(3,{message: "Minimum 3 characters are required"}),
    accountId:z.string(),
})