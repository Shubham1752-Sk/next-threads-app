"use client"

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createThread } from "@/lib/actions/thread.actions";
import { usePathname, useRouter } from "next/navigation";
import { threadValidation } from "@/lib/validations/thread";
import { useState } from "react";
import { useOrganization } from "@clerk/nextjs";

function PostThread({ userId }: { userId: string }) {

    const router = useRouter();
    const pathname = usePathname();
    const { organization } = useOrganization();
    // console.log(pathname)

    const [value, setValue] = useState("");
    const submitHandler = async (e: any) => {
        await createThread({
            text: value,
            author: userId,
            communityId: organization ? organization.id : null,
            path: pathname
        });


        router.push('/')
    }

    return (
        <form onSubmit={submitHandler} className="flex flex-col gap-10 ">
            <label className="mt-10 text-2xl text-light-1 font-bold">Content</label>
            <input type="textarea" className="h-[10rem] bg-dark-2 text-light-2 text-start " value={value} onChange={(e) => {
                setValue(e.target.value);
            }} />
            <button className="w-full bg-primary-500 text-light-2 text-xl font-bold py-3 rounded-lg" type="submit" >Post Thread</button>
        </form>
    )
}

export default PostThread;