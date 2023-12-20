"use server"

import { connectToDB } from "../mongoose"
import Thread from "../models/thread.models"
import User from "../models/user.model"
import { revalidatePath } from "next/cache";

interface Params {
    text: string,
    author: string,
    communityId: string | null,
    path: string
}
export async function createThread({ text, author, communityId, path }: Params) {
    console.log("in the create thread function")
    try {

        connectToDB();
        console.log("Db connected successfully!!")
        const createdThread = await Thread.create({
            text,
            author,
            community: null
        });

        // update user model

        await User.findByIdAndUpdate(author, {
            $push: { threads: createdThread._id }
        })

        revalidatePath(path);
    } catch (error: any) {
        throw new Error(`error while creating thread :${error.message}`)
    }

}

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
  connectToDB();
  // console.log("hello");
  // Calculate the number of posts to skip based on the page number and page size.
  const skipAmount = (pageNumber - 1) * pageSize;

  // Create a query to fetch the posts that have no parent (top-level threads) (a thread that is not a comment/reply).
  const postsQuery = Thread.find({ parentId: { $in: [null, undefined] } })
    .sort({ createdAt: "desc" })
    .skip(skipAmount)
    .limit(pageSize)
    .populate({
      path: "author",
      model: User,
    })
    .populate({
      path: "children", // Populate the children field
      populate: {
        path: "author", // Populate the author field within children
        model: User,
        select: "_id name parentId image", // Select only _id and username fields of the author
      },
    });


  // Count the total number of top-level posts (threads) i.e., threads that are not comments.
  const totalPostsCount = await Thread.countDocuments({
    parentId: { $in: [null, undefined] },
  }); // Get the total count of posts

  const posts = await postsQuery.exec();

  const isNext = totalPostsCount > skipAmount + posts.length;
 
  return { posts,isNext };
}

export async function fetchThreadById(id:string) {
  try {
    // populate community
    const thread = await Thread.findById(id)
      .populate({
        path: 'author',
        model: User,
        select: "_id id name image"
      })
      .populate({
        path: 'children',
        populate: [
          {
            path: 'author',
            model: User,
            select: "_id id name parentId image"
          },
          {
            path: 'children',
            model: Thread,
            populate: {
              path: 'author',
              model: User,
              select: "_id id name parentId image"
            }
          }
        ]
      }).exec();

      return thread;
  } catch (error: any) {
    throw new Error(`some error occured while fetching thread ${error.message}`)
  }
}

export async function addCommentToThread(
  threadId: string,
  commentText: string,
  userid: string,
  path: string
  ) {

    connectToDB();
    try {
      
      const originalThread = await Thread.findById(threadId);

      if(!originalThread){
        throw new Error("Thread not Foud!!")
      }

      const commentThread = new Thread({
        text: commentText,
        author: userid,
        parentId: threadId,
      })

      const savedComment = await commentThread.save();

      // update the original thread to include the new thread
      originalThread.children.push(savedComment._id)

      // save the original thread
      await originalThread.save()

      revalidatePath(path);


    } catch (error:any) {
      throw new Error(`Unable to post Comment : ${error.message}`)
    }
  
}