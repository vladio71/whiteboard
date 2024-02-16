import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {auth} from "@/firebase/firebase";
// import {auth} from "@/firebase/firebase";




export function middleware(request: NextRequest) {
    // const currentUser = request.cookies.get('currentUser')?.value
    // var token =  auth.currentUser?.getIdToken()
    // console.log(auth.currentUser)
    const currentUser = request.cookies.get("authStatus")

    // console.log(new URL('/auth', request.url).pathname)
    if (currentUser) {
        return NextResponse.rewrite(new URL('/menu', request.url))
    }
    return NextResponse.rewrite(new URL('/auth', request.url))
}

export const config = {
    matcher: '/menu',
}