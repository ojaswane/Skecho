import React from 'react'
import { BarLoader } from 'react-spinners'
const loading = () => {
    return (
        <div className=' flex justify-center items-center h-screen'>
            <BarLoader color="#36d7b7" width={200} />
        </div>
    )
}

export default loading