"use client";

import { signOutUser } from "@/app/actions";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { UI } from "@/lib/i18n";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOutUser();
    toast({
        title: "Амжилттай гарлаа"
    });
    router.push('/');
    router.refresh();
  };

  return (
    <DropdownMenuItem onClick={handleSignOut}>
      <LogOut className="mr-2 h-4 w-4" />
      <span>{UI.GENERAL.LOGOUT}</span>
    </DropdownMenuItem>
  );
}
