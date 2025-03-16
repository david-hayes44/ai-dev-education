"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { SupabaseDiagnostic } from './diagnostic'

export default function SupabaseTestPage() {
  const router = useRouter()
  
  const testPages = [
    {
      title: 'Connection Diagnostics',
      description: 'Advanced diagnostics for Supabase connection issues',
      path: '/supabase-diagnostics',
      icon: '🔍'
    },
    {
      title: 'Server-Side Storage',
      description: 'Test file uploads using server-side API to bypass CORS issues',
      path: '/server-storage-test',
      icon: '🔄'
    },
    {
      title: 'Supabase Setup',
      description: 'Create required buckets and tables in Supabase',
      path: '/supabase-setup',
      icon: '🔧'
    },
    {
      title: 'Manual Setup Guide',
      description: 'Step-by-step guide to manually create buckets in Supabase dashboard',
      path: '/supabase-setup-form',
      icon: '📋'
    },
    {
      title: 'Direct Storage Setup',
      description: 'Fix storage issues by directly creating buckets and policies',
      path: '/supabase-direct-setup',
      icon: '🛠️'
    },
    {
      title: 'Direct Storage Test',
      description: 'Test storage with direct REST API fallback for reliable uploads',
      path: '/supabase-direct-storage-test',
      icon: '📤'
    },
    {
      title: 'Storage Test',
      description: 'Test Supabase Storage functionality with file uploads and downloads',
      path: '/storage-test',
      icon: '📁'
    },
    {
      title: 'Database Test',
      description: 'Test Supabase Database with CRUD operations and realtime subscriptions',
      path: '/database-test',
      icon: '🗄️'
    },
    {
      title: 'Integrated Chat',
      description: 'Test complete integration of Supabase with chat functionality',
      path: '/chat-supabase',
      icon: '💬'
    }
  ]
  
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-2">Supabase Migration Tests</h1>
      <p className="text-gray-500 mb-8">
        Test components for the migration from Firebase to Supabase
      </p>
      
      <SupabaseDiagnostic />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testPages.map(page => (
          <Card key={page.path} className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">{page.icon}</span>
                <span>{page.title}</span>
              </CardTitle>
              <CardDescription>
                {page.description}
              </CardDescription>
            </CardHeader>
            <CardFooter className="mt-auto">
              <Button 
                className="w-full" 
                onClick={() => router.push(page.path)}
              >
                Open Test Page
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <div className="mt-10 p-6 border rounded-lg bg-gray-50">
        <h2 className="text-xl font-bold mb-3">Migration Progress</h2>
        <ul className="space-y-2">
          <li className="flex items-start">
            <span className="inline-block w-6 text-green-500">✅</span>
            <span>Supabase environment variables configured</span>
          </li>
          <li className="flex items-start">
            <span className="inline-block w-6 text-green-500">✅</span>
            <span>Storage service implementation</span>
          </li>
          <li className="flex items-start">
            <span className="inline-block w-6 text-green-500">✅</span>
            <span>Database service implementation</span>
          </li>
          <li className="flex items-start">
            <span className="inline-block w-6 text-green-500">✅</span>
            <span>Chat state context provider</span>
          </li>
          <li className="flex items-start">
            <span className="inline-block w-6 text-yellow-500">⏳</span>
            <span>Testing all components</span>
          </li>
          <li className="flex items-start">
            <span className="inline-block w-6 text-gray-300">⭕</span>
            <span>Main app integration</span>
          </li>
          <li className="flex items-start">
            <span className="inline-block w-6 text-gray-300">⭕</span>
            <span>Firebase deprecated and removed</span>
          </li>
        </ul>
      </div>
    </div>
  )
} 