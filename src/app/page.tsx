import { CircleArrowOutUpRight } from 'lucide-react';
import Link from 'next/link';
export default function Home() {
  return (
    <div className="h-screen flex flex-col tracking-tighter justify-center items-center m-0">
      <h1 className="text-6xl font-bold  ">Welcome to Sketcho</h1>
      <h3 className="text-3xl mt-4">This App is Under development</h3>
      <button className="mt-6 text-xl bg-gray-400 p-3 rounded-2xl text-black   border-2 border-gray-300  cursor-pointer ">
        <Link href="/dashboard" className='flex items-center gap-2'>
          Get to the dashboard <CircleArrowOutUpRight className='w-5' />
        </Link>
      </button>
    </div>
  );
}
