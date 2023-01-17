import { Page } from 'components/Page'
import { PageHeader } from 'components/PageHeader'
import { TERMS_AND_CONDITIONS_INDEX } from 'config/constants'
import type { NextPage } from 'next'
import Link from 'next/link'

const TermsAndConditions: NextPage = () => {
  return (
    <Page name='Terms and Conditions' index={TERMS_AND_CONDITIONS_INDEX}>
      <main className='mx-auto max-w-4xl'>
        <PageHeader title='Terms & Conditions' />
        <div className=' mx-auto flex flex-col gap-2'>
          <h2 className='text-xl tracking-wide '>Terms</h2>
          <p>
            By accessing this Website, accessible from{' '}
            <Link
              className='text-neutral-700 underline dark:text-neutral-300'
              href='https://miru.space'
            >
              https://miru.space
            </Link>{' '}
            , you are agreeing to be bound by these Website Terms and Conditions
            of Use and agree that you are responsible for the agreement with any
            applicable local laws. If you disagree with any of these terms, you
            are prohibited from accessing this site. The materials contained in
            this Website are protected by copyright and trade mark law.
          </p>
          <h2 className='text-xl tracking-wide '>Use License</h2>
          <p>
            Permission is granted to temporarily download one copy of the
            materials on Miru&apos;s Website for personal, non-commercial
            transitory viewing only. This is the grant of a license, not a
            transfer of title, and under this license you may not:
          </p>
          <ul className='list-inside list-disc'>
            <li>modify or copy the materials;</li>
            <li>
              use the materials for any commercial purpose or for any public
              display;
            </li>
            <li>
              attempt to reverse engineer any software contained on Miru&apos;s
              Website;
            </li>
            <li>
              remove any copyright or other proprietary notations from the
              materials; or
            </li>
            <li>
              transferring the materials to another person or
              &ldquo;mirror&rdquo; the materials on any other server.
            </li>
          </ul>
          <p>
            This will let Miru to terminate upon violations of any of these
            restrictions. Upon termination, your viewing right will also be
            terminated and you should destroy any downloaded materials in your
            possession whether it is printed or electronic format. These Terms
            of Service has been created with the help of the{' '}
            <Link
              className='text-neutral-700 underline dark:text-neutral-300'
              target='_blank'
              href='https://www.termsofservicegenerator.net'
            >
              Terms Of Service Generator
            </Link>
            .
          </p>
          <h2 className='text-xl tracking-wide '> Disclaimer</h2>

          <p>
            All the materials on Miru&apos;s Website are provided &ldquo;as
            is&rdquo;. Miru makes no warranties, may it be expressed or implied,
            therefore negates all other warranties. Furthermore, Miru does not
            make any representations concerning the accuracy or reliability of
            the use of the materials on its Website or otherwise relating to
            such materials or any sites linked to this Website.
          </p>

          <h2 className='text-xl tracking-wide '>Limitations</h2>

          <p>
            Miru or its suppliers will not be hold accountable for any damages
            that will arise with the use or inability to use the materials on
            Miru&apos;s Website, even if Miru or an authorize representative of
            this Website has been notified, orally or written, of the
            possibility of such damage. Some jurisdiction does not allow
            limitations on implied warranties or limitations of liability for
            incidental damages, these limitations may not apply to you.
          </p>

          <h2 className='text-xl tracking-wide '> Revisions and Errata</h2>

          <p>
            The materials appearing on Miru&apos;s Website may include
            technical, typographical, or photographic errors. Miru will not
            promise that any of the materials in this Website are accurate,
            complete, or current. Miru may change the materials contained on its
            Website at any time without notice. Miru does not make any
            commitment to update the materials.
          </p>

          <h2 className='text-xl tracking-wide '> Links</h2>

          <p>
            Miru has not reviewed all of the sites linked to its Website and is
            not responsible for the contents of any such linked site. The
            presence of any link does not imply endorsement by Miru of the site.
            The use of any linked website is at the user&apos;s own risk.
          </p>

          <h2 className='text-xl tracking-wide '>
            Site Terms of Use Modifications
          </h2>

          <p>
            Miru may revise these Terms of Use for its Website at any time
            without prior notice. By using this Website, you are agreeing to be
            bound by the current version of these Terms and Conditions of Use.
          </p>

          <h2 className='text-xl tracking-wide '> Your Privacy</h2>

          <p>Please read our Privacy Policy.</p>

          <h2 className='text-xl tracking-wide '>Governing Law</h2>

          <p>
            Any claim related to Miru&apos;s Website shall be governed by the
            laws of gb without regards to its conflict of law provisions.
          </p>
        </div>
      </main>
    </Page>
  )
}

export default TermsAndConditions
