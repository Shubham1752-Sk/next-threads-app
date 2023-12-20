import { currentUser } from "@clerk/nextjs";
import ThreadCard from "@/components/cards/ThreadCard";
import { fetchUser } from "@/lib/actions/user.actions";
import { fetchThreadById } from "@/lib/actions/thread.actions";
import { redirect } from "next/navigation";
import Comment from "@/components/forms/Comment";

const Page = async ({ params }: { params: { id: string } }) => {
    if (!params.id)
        return null;

    const user = await currentUser();
    const userInfo = await fetchUser(user.id);
    if (!userInfo?.onboarded) redirect("/onboarding")
    const thread = await fetchThreadById(params.id)
    return (
        <section className="relative">
            <div>
                <ThreadCard
                    key={thread._id}
                    id={thread._id}
                    currentUserId={user?.id || ""}
                    parentId={thread.parentId}
                    content={thread.text}
                    community={thread.community}
                    createdAt={thread.createdAt}
                    comments={thread.children}
                    author={thread.author}
                />
            </div>
            <div className="mt-7">
                <Comment
                    threadId={thread.id}
                    currentUserImg={user?.imageUrl}
                    currentUserId={JSON.stringify(userInfo._id)}
                />
                <div className="mt-10">
                    {
                        thread.children.map((childItem: any)=>(
                            <ThreadCard
                            key={childItem._id}
                            id={childItem._id}
                            currentUserId={user?.id || ""}
                            parentId={childItem.parentId}
                            content={childItem.text}
                            community={childItem.community}
                            createdAt={childItem.createdAt}
                            comments={childItem.children}
                            author={childItem.author}
                            isComment
                        /> 
                        ))
                    }
                </div>
            </div>
        </section>
    );
}

export default Page;