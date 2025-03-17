'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useAuthContext } from '@/components/providers/auth-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, isAuthenticated, loading, signOut } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('info');

  if (loading) {
    return (
      <div className="container mx-auto flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-2">
          <div className="h-16 w-16 animate-pulse rounded-full bg-muted"></div>
          <div className="h-6 w-24 animate-pulse rounded bg-muted"></div>
          <div className="mt-2 h-4 w-48 animate-pulse rounded bg-muted"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  const userInitial = user?.displayName?.[0] || user?.email?.[0] || '?';

  return (
    <div className="container mx-auto py-10">
      <div className="mx-auto max-w-3xl">
        <Card className="mb-8">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'User'} />
                <AvatarFallback className="text-2xl">{userInitial.toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-xl">{user?.displayName || 'User'}</CardTitle>
            <CardDescription>{user?.email}</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="info">Profile Info</TabsTrigger>
              </TabsList>
              <TabsContent value="info" className="mt-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="font-medium">User ID</div>
                    <div className="text-muted-foreground break-all">{user?.id}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="font-medium">Display Name</div>
                    <div className="text-muted-foreground">{user?.displayName || '-'}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="font-medium">Email</div>
                    <div className="text-muted-foreground">{user?.email}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="font-medium">Authentication Provider</div>
                    <div className="text-muted-foreground">{user?.provider || '-'}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="font-medium">Authentication System</div>
                    <div className="text-muted-foreground">Supabase</div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button
              variant="outline"
              onClick={async () => {
                await signOut();
                router.push('/login');
              }}
            >
              Sign Out
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 