"use client";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { UI } from "@/lib/i18n";
import { LogOut } from "lucide-react";
import { useAuth } from "@/firebase";
import { signOut } from "firebase/auth";

export function SignOutButton() {
  const auth = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    if (!auth) return;
    await signOut(auth);
    // The AuthListener component will handle cookie deletion and page refresh.
    toast({
        title: "Амжилттай гарлаа"
    });
  };

  return (
    <DropdownMenuItem onClick={handleSignOut}>
      <LogOut className="mr-2 h-4 w-4" />
      <span>{UI.GENERAL.LOGOUT}</span>
    </DropdownMenuItem>
  );
}
