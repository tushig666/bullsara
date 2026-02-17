'use client';

import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { UI } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminContext } from './AdminContext';

export function AdminGate({ children }: { children: React.ReactNode }) {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const adminRoleRef = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return doc(firestore, 'roles_admin', user.uid);
    }, [firestore, user]);

    const { data: adminRoleDoc, isLoading: isAdminRoleLoading } = useDoc(adminRoleRef);
    
    const isLoading = isUserLoading || isAdminRoleLoading;

    if (isLoading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    const isAuthorized = !!user && !!adminRoleDoc;

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

    return <AdminContext.Provider value={{ isAuthorized }}>{children}</AdminContext.Provider>;
}
