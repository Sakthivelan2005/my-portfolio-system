import { useEffect } from 'react';

export default function Analytics() {
  useEffect(() => {
    let clarityLoaded = false;

    const loadClarity = () => {
      if (clarityLoaded) return;
      clarityLoaded = true;

      /* eslint-disable @typescript-eslint/no-explicit-any, prefer-rest-params */
      (function(c: any, l: Document, a: string, r: string, i: string, t?: any, y?: any){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r) as HTMLScriptElement;
          t.async=1;
          t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];
          if(y && y.parentNode) y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", "y9wmlm1qhu");
      /* eslint-enable @typescript-eslint/no-explicit-any, prefer-rest-params */

      window.removeEventListener('scroll', loadClarity);
      window.removeEventListener('mousemove', loadClarity);
      window.removeEventListener('touchstart', loadClarity);
    };

    window.addEventListener('scroll', loadClarity, { passive: true });
    window.addEventListener('mousemove', loadClarity, { passive: true });
    window.addEventListener('touchstart', loadClarity, { passive: true });

    return () => {
      window.removeEventListener('scroll', loadClarity);
      window.removeEventListener('mousemove', loadClarity);
      window.removeEventListener('touchstart', loadClarity);
    };
  }, []);

  return null;
}