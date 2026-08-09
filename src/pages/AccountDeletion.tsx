import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Trash2, ArrowLeft, Mail } from "lucide-react";

/**
 * Account Deletion — web-based deletion resource (Google Play requirement).
 *
 * Google Play requires apps that support account creation to provide a web-based
 * resource where users can request account and data deletion. This page documents
 * the in-app deletion path and provides a support contact for manual requests.
 */
const AccountDeletion = () => {
  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Button asChild variant="ghost" size="sm" className="mb-6">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to app
          </Link>
        </Button>

        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
            <Trash2 className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Account &amp; Data Deletion</h1>
            <p className="text-sm text-muted-foreground">Last updated: August 2026</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>How to delete your account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              You can delete your account and all associated data directly from within the app.
              This is the fastest and most complete way to remove your information.
            </p>
            <div className="rounded-xl border border-border/50 bg-muted/40 p-4">
              <p className="font-semibold text-foreground">In-app steps:</p>
              <ol className="mt-2 list-decimal space-y-1 pl-5">
                <li>Open the app and go to the <strong>Account / Settings</strong> screen.</li>
                <li>Tap <strong>Delete Account</strong>.</li>
                <li>Confirm the permanent-deletion prompt.</li>
                <li>You will be signed out and shown a confirmation screen.</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        <Separator className="my-8" />

        <div className="space-y-8">
          <section>
            <h2 className="mb-3 text-lg font-semibold">What gets deleted</h2>
            <Card>
              <CardContent className="space-y-3 pt-6 text-sm leading-relaxed text-muted-foreground">
                <p>Deleting your account permanently removes:</p>
                <ul className="list-disc space-y-1 pl-5">
                  <li>Your authentication record and login credentials.</li>
                  <li>Your profile and account information.</li>
                  <li>All assessment data, responses, and uploaded images associated with your account.</li>
                  <li>Any other data linked to your account.</li>
                </ul>
                <p>
                  Any data we are legally required to retain is anonymized so it can no longer be
                  linked to you.
                </p>
              </CardContent>
            </Card>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">Request deletion by email</h2>
            <Card>
              <CardContent className="space-y-3 pt-6 text-sm leading-relaxed text-muted-foreground">
                <p>
                  If you are unable to delete your account in-app, you may request deletion by
                  email. Please include the email address associated with your account.
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <a href="mailto:privacy@medcalc.example.com" className="text-primary underline">
                    privacy@medcalc.example.com
                  </a>
                </p>
                <p className="text-xs text-muted-foreground/80">
                  We will process deletion requests within 30 days and confirm once complete.
                </p>
              </CardContent>
            </Card>
          </section>
        </div>

        <Separator className="my-8" />
        <p className="text-center text-xs text-muted-foreground">
          © 2026 Syncope &amp; Loss of Consciousness Assessment. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default AccountDeletion;
