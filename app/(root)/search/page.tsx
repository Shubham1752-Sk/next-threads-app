import React from 'react'
import { currentUser } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { fetchUser, fetchUsers } from '@/lib/actions/user.actions'
import UserCard from '@/components/cards/UserCard'

async function page() {

    const user = await currentUser();
    
    if(!user) return null;

    const userInfo = await fetchUser(user.id);

    if(!userInfo?.onboarded) redirect('/onboarding')

    const result = await fetchUsers({
        userId: user.id,
        searchString: '',
        pageNumber: 1,
        pageSize: 25
    })

    console.log(result.users)

  return (
    <section>
        <h1 className='head-text'>Search</h1>
        {/* search bar */}
        <div className=' mt-14 flex flex-col gap-9'>

            {
                result.users.length === 0 ?(
                    <p className='no-result'>No Users</p>
                ) : (
                    <>
                        {
                            result.users.map((person)=>(
                                <UserCard 
                                    key={person.id}
                                    id={person.id}
                                    name={person.name}
                                    username={person.username}
                                    imgUrl={person.imgUrl}
                                    personType='User'
                                />
                            ))
                        }
                    </>
                )
            }
        </div>
    </section>
  )
}

export default page