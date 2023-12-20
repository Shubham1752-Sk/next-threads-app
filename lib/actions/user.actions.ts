"use server"

import Thread from "../models/thread.models";
import User from "../models/user.model";
import { connectToDB } from "../mongoose"
import { revalidatePath } from "next/cache";
import { FilterQuery, SortOrder } from "mongoose";

interface Params{
    userId: string;
    username: string;
    name: string;
    bio: string;
    image: string;
    path:string;
}

export async function updateUser({
    userId,
    username,
    name,
    bio,
    image,
    path}: Params): Promise<void> {
    connectToDB();
    try {
        await User.findOneAndUpdate(
            {id:userId},
            {username: username.toLowerCase(),name, bio, image, onboarded: true},
            {upsert: true}
        );

        if( path =='/prfile/edit'){
            revalidatePath(path);
        }
    } catch (error:any) {
        throw new Error(`Failed to create/update user: ,${error.message}`)
    }
}

export async function fetchUser(userId:string) {
    try {
        connectToDB();
        return await User
        .findOne({id: userId})
        // .populate({
        //     path: 'Communities',
        //     model: Community
        // })
    } catch (error: any) {
        throw new Error(`failed to fetch User : ${error.message}`)
    }
}

export async function fetchUserPosts( userId: string){
    try {
        
        connectToDB();
        // console.log("in func")
        // fetch all the posts by the user
        // TODO Community
        const threads = await User.findOne({id: userId})
        .populate({
            path: 'threads',
            model: Thread,
            populate: [
                // {
                //   path: "community",
                //   model: Community,
                //   select: "name id image _id", // Select the "name" and "_id" fields from the "Community" model
                // },
                {
                  path: "children",
                  model: Thread,
                  populate: {
                    path: "author",
                    model: User,
                    select: "name image id", // Select the "name" and "_id" fields from the "User" model
                  },
                },
            ],
        })

        return threads;
    } catch (error:any) {
        throw new Error(`Error while fetching user Posts : ${error.message}`)
    }
}

export async function fetchUsers({
    userId,
    searchString,
    pageNumber = 1,
    pageSize = 20,
    sortBy = "desc"
}:{
    userId:string,
    searchString?: string,
    pageNumber?: number,
    pageSize?: number,
    sortBy?: SortOrder
}){
    try {

        connectToDB();

        const skipAmount = (pageNumber - 1)* pageSize;

        const regex = new RegExp(searchString, "i");

        const query : FilterQuery<typeof User> = {
            id: {$ne: userId}
        }

        if(searchString?.trim()!==''){
            query.$or= [
                { username: {$regex: regex}},
                { name: {$regex: regex}}
            ]
        }

        const sortOptions = { createdAt: sortBy};

        const usersQuery = User.find(query)
        .sort(sortOptions)
        .skip(skipAmount)
        .limit(pageSize)

        const totalUserCount = await User.countDocuments(query);

        const users = await usersQuery.exec();

        const isNext = totalUserCount > skipAmount + users.length;
        
        return { users, isNext };
        
    } catch (error:any) {
        throw new Error(`Unable to load search Page :${error.message}`)
    }
}

export async function getActivity(userId:string) {
    try {

        connectToDB();

        const userThreads = await Thread.find({author : userId})

        // collect all the child thread (comments) fields
        const childThreadIds = userThreads.reduce((acc,userThread)=>{
            return acc.concat(userThread.children)
        },[])
        
        const replies = Thread.find({
            _id:{$in:childThreadIds},
            author: { $ne: userId}
        }).populate({
            path: 'author',
            model: User,
            select: "name image _id"
        })
        return replies;
    } catch (error:any) {
        throw new Error(`Error while loading activities ${error.message}`)
    }
}