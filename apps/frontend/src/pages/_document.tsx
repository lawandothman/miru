import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang='en'>
      <Head>
        <meta charSet='utf-8' />
        <link rel='shortcut icon' href='/favicon.ico' />
        <link rel='manifest' href='/site.webmanifest' />
        <meta name='application-name' content='Miru' />
        <meta name='apple-mobile-web-app-capable' content='yes' />
        <meta name='apple-mobile-web-app-status-bar-style' content='default' />
        <meta name='apple-mobile-web-app-title' content='Miru' />
        <meta name='format-detection' content='telephone=no' />
        <meta name='mobile-web-app-capable' content='yes' />
        <meta
          name='theme-color'
          media='(prefers-color-scheme: light)'
          content='#FFFFFF'
        />
        <meta
          name='theme-color'
          media='(prefers-color-scheme: dark)'
          content='#000000'
        />
        <link rel='apple-touch-icon' href='/touch-icon-iphone.png' />
        <link
          rel='icon'
          type='image/png'
          sizes='32x32'
          href='/favicon-32x32.png'
        />
        <link
          rel='icon'
          type='image/png'
          sizes='16x16'
          href='/favicon-16x16.png'
        />
        <link
          href='splashscreens/iphone5_splash.png'
          media='(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)'
          rel='apple-touch-startup-image'
        />
        <link
          href='splashscreens/iphone6_splash.png'
          media='(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)'
          rel='apple-touch-startup-image'
        />
        <link
          href='splashscreens/iphoneplus_splash.png'
          media='(device-width: 621px) and (device-height: 1104px) and (-webkit-device-pixel-ratio: 3)'
          rel='apple-touch-startup-image'
        />
        <link
          href='splashscreens/iphonex_splash.png'
          media='(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)'
          rel='apple-touch-startup-image'
        />
        <link
          href='splashscreens/iphonexr_splash.png'
          media='(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)'
          rel='apple-touch-startup-image'
        />
        <link
          href='splashscreens/iphonexsmax_splash.png'
          media='(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)'
          rel='apple-touch-startup-image'
        />
        <link
          href='splashscreens/ipad_splash.png'
          media='(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)'
          rel='apple-touch-startup-image'
        />
        <link
          href='splashscreens/ipadpro1_splash.png'
          media='(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2)'
          rel='apple-touch-startup-image'
        />
        <link
          href='splashscreens/ipadpro3_splash.png'
          media='(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)'
          rel='apple-touch-startup-image'
        />
        <link
          href='splashscreens/ipadpro2_splash.png'
          media='(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)'
          rel='apple-touch-startup-image'
        />
        <meta name='apple-mobile-web-app-capable' content='yes' />
        <link rel='manifest' href='/manifest.json' />
      </Head>
      <body className='dark:bg-black'>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
