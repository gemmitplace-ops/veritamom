import { redirect } from 'next/navigation';

export default function ResearchPage({ params: { locale } }: { params: { locale: string } }) {
  // Research feed lives on the homepage
  redirect(`/${locale}`);
}
