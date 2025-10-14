'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseclient'
import { SidebarComponent } from '@/components/ui/sidebarComponent/sidebar'
const page = () => {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data?.user)
    }
    fetchUser()
    console.log(user)
  }, [])

  return (
    <SidebarComponent />
  )
}

export default page
