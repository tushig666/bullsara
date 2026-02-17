'use client';

import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { notFound } from 'next/navigation';
import { UserProfile } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { UI } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';

export function AdminGate({ children }: { children: React.ReactNode }) {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const userProfileRef = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user]);

    const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);
    
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isAuthCheckComplete, setIsAuthCheckComplete] = useState(false);
    
    const isLoading = isUserLoading || isProfileLoading;

    useEffect(() => {
        if (!isLoading) {
            if (user && userProfile && userProfile.role === 'admin') {
                setIsAuthorized(true);
            } else {
                setIsAuthorized(false);
            }
            setIsAuthCheckComplete(true);
        }
    }, [isLoading, user, userProfile]);

    if (!isAuthCheckComplete) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!isAuthorized) {
        return (
             <div className="flex min-h-[50vh] items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-center text-destructive">{UI.GENERAL.ERROR}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-center text-muted-foreground">
                            You are not authorized to view this page.
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return <>{children}</>;
}
