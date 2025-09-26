'use client'

import UserList from '@/components/UserList'
import React from 'react'

import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const layout = ({ children }: LayoutProps) => {
  return (
     <div className="flex h-screen bg-gray-100">
<div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
   
       <UserList/>
      </div>
    {children}
    </div>
  )
}

export default layout