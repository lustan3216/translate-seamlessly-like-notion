import { useLanguage } from "@/contexts/LanguageContext";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Mail } from "lucide-react";

declare global {
  interface Window {
    $crisp: any;
  }
}

const Support = () => {
  const { t } = useLanguage();

  const openCrispChat = () => {
    if (window.$crisp) {
      window.$crisp.push(["do", "chat:open"]);
    } else {
      // Fallback: try to find and click the crisp chat button
      const crispButton = document.querySelector('.crisp-client');
      if (crispButton) {
        (crispButton as HTMLElement).click();
      }
    }
  };

  const openEmailClient = () => {
    window.location.href = `mailto:${t('support.email.address')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <SEO 
        title={t('meta.support.title')}
        description={t('meta.support.description')}
      />
      <Navigation />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('support.heading')}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {t('support.description')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="hover:shadow-lg transition-shadow flex flex-col">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <MessageCircle className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl font-semibold">
                  {t('support.chat.title')}
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  {t('support.chat.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center flex-grow flex flex-col justify-end">
                <Button 
                  onClick={openCrispChat}
                  className="w-full text-white"
                  size="lg"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {t('support.chat.button')}
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow flex flex-col">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl font-semibold">
                  {t('support.email.title')}
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  {t('support.email.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center flex-grow flex flex-col justify-end">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  {t('support.email.address')}
                </p>
                <Button 
                  onClick={openEmailClient}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  {t('support.email.button')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Support;