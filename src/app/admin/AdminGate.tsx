'use client';

import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { UI } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function AdminGate({ children }: { children: React.ReactNode }) {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    // The reference now points to the roles_admin collection to match security rules
    const adminRoleRef = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return doc(firestore, 'roles_admin', user.uid);
    }, [firestore, user]);

    // We only care about the existence of the document, not its content.
    // useDoc's `data` will be non-null if the doc exists, confirming admin status.
    const { data: adminRoleDoc, isLoading: isAdminRoleLoading } = useDoc(adminRoleRef);
    
    // Combined loading state
    const isLoading = isUserLoading || isAdminRoleLoading;

    if (isLoading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    // After loading, check for authorization.
    // A non-null user and a non-null adminRoleDoc means the document exists, so the user is an admin.
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

    // If authorized, render the admin content.
    return <>{children}</>;
}
