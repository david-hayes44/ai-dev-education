'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function SignupPage() {
  const router = useRouter();
  const { signUp, signInWithGoogle, signInWithGithub, error, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setAuthError("Passwords do not match");
      return;
    }
    
    try {
      const user = await signUp(email, password);
      if (user) {
        // Email confirmation might be required
        setSignupSuccess(true);
      }
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Signup failed. Please try again.');
    }
  };

  const handleGoogleSignup = async () => {
    setAuthError(null);
    try {
      const user = await signInWithGoogle();
      if (user) {
        router.push('/');
      }
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Google signup failed. Please try again.');
    }
  };

  const handleGithubSignup = async () => {
    setAuthError(null);
    try {
      const user = await signInWithGithub();
      if (user) {
        router.push('/');
      }
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'GitHub signup failed. Please try again.');
    }
  };

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
          <p className="text-sm text-muted-foreground">
            Enter your details to create your account
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>
              Choose your preferred sign up method
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {signupSuccess ? (
              <Alert className="bg-green-50 border-green-200">
                <AlertDescription className="text-green-800">
                  Account created successfully! {email.includes('@') && 
                    "Please check your email to confirm your account."}
                </AlertDescription>
              </Alert>
            ) : (
              <>
                {(authError || error) && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {authError || (error && error.message) || 'Authentication error occurred.'}
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" disabled={loading} onClick={handleGoogleSignup}>
                    Google
                  </Button>
                  <Button variant="outline" disabled={loading} onClick={handleGithubSignup}>
                    GitHub
                  </Button>
                </div>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
                
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-500 hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 