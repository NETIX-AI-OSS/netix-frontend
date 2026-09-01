'use client'

import { Contact, Mail } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { CardDescription, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getFullUserName, getUserNameInitials } from '@/lib/utils'

interface User {
  first_name: string
  last_name: string
  designation?: string
  email?: string
}

// Sample user data - replace with actual user data
const user: User = {
  first_name: 'Andrew',
  last_name: 'Patterson',
  designation: 'Engineer',
  email: 'andrew.patterson@netix.ai',
}

export function ProfileMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-card text-xs font-semibold text-primary hover:bg-muted"
            aria-label="Open profile menu"
          />
        }
      >
        {getUserNameInitials(user)}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="mt-1 mr-4 w-64 pt-3" align="end">
        <CardTitle className="pl-2 pr-6 pb-1">{getFullUserName(user)}</CardTitle>
        {user.designation && (
          <CardDescription className="px-2 flex items-center">
            <Contact className="size-3.5 mr-2" />
            {user.designation}
          </CardDescription>
        )}
        {user.email && (
          <CardDescription className="px-2 flex items-center">
            <Mail className="size-3.5 mr-2" />
            {user.email}
          </CardDescription>
        )}
        <div className="my-1 h-px w-full bg-border" />
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <div className="my-1 h-px w-full bg-border" />
        <DropdownMenuItem>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
