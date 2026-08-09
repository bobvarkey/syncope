import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Shield, ArrowLeft, Mail } from "lucide-react";

const PrivacyPolicy = () => {
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
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Privacy Policy</h1>
            <p className="text-sm text-muted-foreground">Last updated: August 2026</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              This Privacy Policy explains how the Syncope &amp; Loss of Consciousness
              Assessment application ("the app", "we", "us") collects, uses, and protects
              information when you use our service. We are committed to protecting your
              privacy and handling your data transparently.
            </p>
          </CardContent>
        </Card>

        <Separator className="my-8" />

        <div className="space-y-8">
          <section>
            <h2 className="mb-3 text-lg font-semibold">1. Information We Collect</h2>
            <Card>
              <CardContent className="space-y-3 pt-6 text-sm leading-relaxed text-muted-foreground">
                <p><strong className="text-foreground">Account information.</strong> If you create an account, we collect your email address and authentication details (via email/password, Google, or Apple sign-in).</p>
                <p><strong className="text-foreground">Assessment data.</strong> Clinical questionnaire responses you enter are stored to provide the assessment service. This data is stored securely and is only accessible to you.</p>
                <p><strong className="text-foreground">Uploaded images.</strong> ECG or other images you upload are stored to support your assessment.</p>
                <p><strong className="text-foreground">Usage data.</strong> We do not use third-party analytics or tracking SDKs. We do not collect advertising identifiers (IDFA) or perform cross-app tracking.</p>
              </CardContent>
            </Card>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">2. How We Use Information</h2>
            <Card>
              <CardContent className="space-y-3 pt-6 text-sm leading-relaxed text-muted-foreground">
                <p>We use the information we collect to:</p>
                <ul className="list-disc space-y-1 pl-5">
                  <li>Provide, operate, and maintain the assessment service.</li>
                  <li>Store your assessment data so you can access it across sessions.</li>
                  <li>Authenticate your account and keep it secure.</li>
                  <li>Respond to your support requests.</li>
                </ul>
                <p>We do not sell your personal data. We do not use your data for advertising.</p>
              </CardContent>
            </Card>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">3. Data Storage &amp; Security</h2>
            <Card>
              <CardContent className="space-y-3 pt-6 text-sm leading-relaxed text-muted-foreground">
                <p>Your data is stored securely using industry-standard encryption in transit and at rest. Access to your account and assessment data is protected by your authentication credentials.</p>
                <p>We retain your data only for as long as your account is active or as needed to provide the service, comply with legal obligations, resolve disputes, and enforce our agreements.</p>
              </CardContent>
            </Card>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">4. Your Rights &amp; Account Deletion</h2>
            <Card>
              <CardContent className="space-y-3 pt-6 text-sm leading-relaxed text-muted-foreground">
                <p>You may request access to, correction of, or deletion of your personal data at any time.</p>
                <p>
                  <strong className="text-foreground">Deleting your account</strong> permanently removes your
                  authentication record and all associated data, including your profile, assessment
                  responses, and uploaded images. After deletion you will be signed out. Any data we are
                  legally required to retain is anonymized so it can no longer be linked to you.
                </p>
                <p>You can initiate account deletion from within the app's account/settings screen.</p>
              </CardContent>
            </Card>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">5. Children's Privacy</h2>
            <Card>
              <CardContent className="space-y-3 pt-6 text-sm leading-relaxed text-muted-foreground">
                <p>This app is intended for use by healthcare professionals, clinicians, residents, and medical students. It is not directed to children under the age of 13, and we do not knowingly collect personal information from children.</p>
              </CardContent>
            </Card>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">6. Changes to This Policy</h2>
            <Card>
              <CardContent className="space-y-3 pt-6 text-sm leading-relaxed text-muted-foreground">
                <p>We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date.</p>
              </CardContent>
            </Card>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">7. Contact Us</h2>
            <Card>
              <CardContent className="space-y-3 pt-6 text-sm leading-relaxed text-muted-foreground">
                <p>If you have any questions about this Privacy Policy or your data, please contact us:</p>
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <a href="mailto:privacy@medcalc.example.com" className="text-primary underline">
                    privacy@medcalc.example.com
                  </a>
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

export default PrivacyPolicy;
