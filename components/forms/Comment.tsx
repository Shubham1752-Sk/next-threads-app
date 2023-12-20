"use client"
import React from 'react'
import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import * as z from "zod";
import Image from 'next/image';
import { addCommentToThread } from '@/lib/actions/thread.actions';

interface props{
    threadId: string,
    currentUserImg: string,
    currentUserId: string
}

const Comment = ({ threadId, currentUserImg, currentUserId}: props) => {
    
    const router = useRouter();
    const pathname = usePathname();
    
    const [comment,setComment]=useState("");
    const [ inputFieldActive, setInputFieldActive ] = useState(false)
    const [ errorMessage, setErrorMessage ] = useState("")

    const submitHandler = async (e:any) => {
        e.preventDefault();
        console.log("in the on submit function")

        // let me make some checks 
        if( comment.trim().length==0){
            setErrorMessage("Comment can't be Empty!!");
            setComment("");
            document.getElementById('comment').value="";
            return
        }

        if(comment.trim().length<3){
            setErrorMessage("Minimun 3 characters are required!!");
            setComment("");
            document.getElementById('comment').value="";
            return
        }

        await addCommentToThread(threadId, comment, JSON.parse(currentUserId), pathname);

        document.getElementById('comment').value="";
        setComment("");
    }
    
    return (
        <div className='text-white'>
            <p>Comments</p>
            <form onSubmit={submitHandler} className="comment-form ">
                <div className='flex w-full justify-between'>
                    <label>
                        <Image 
                            src={currentUserImg}
                            alt="User Image"
                            width={48}
                            height={48}
                            className='rounded-full object-cover'
                        />
                    </label>
                    <input type="text" id='comment' onClick={setInputFieldActive} placeholder='Comment...' className="bg-transparent border-none border-dark-2 w-8/12" value={comment} onChange={(e)=>{
                        setComment(e.target.value);
                    }} />
                    <button className="comment-form_btn" type="submit" >Reply</button>
                </div>
                {
                    !errorMessage && !inputFieldActive ? 
                    (
                        <div></div>
                    ):(
                        <p className='text-sm text-red-700'>{errorMessage}</p>
                    )
                }
                        
            </form>
        </div>
    )
}

export default Comment