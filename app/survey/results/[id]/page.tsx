import { notFound } from 'next/navigation';

interface SurveyResultPageProps {
  params: {
    id: string;
  };
}

export default function SurveyResultPage({ params }: SurveyResultPageProps) {
  const { id } = params;

  if (!id) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">설문 결과</h1>
      <p className="text-gray-600">결과 ID: {id}</p>
      <p className="text-gray-500 mt-4">이 페이지는 개발 중입니다.</p>
    </div>
  );
} 