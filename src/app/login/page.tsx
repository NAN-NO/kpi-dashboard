import LoginForm from "./LoginForm"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4 shadow-md">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">ระบบฐานข้อมูลตัวชี้วัด</h2>
          <p className="text-gray-500 mt-2">Clinic Governance (CG KPI Dashboard)</p>
        </div>
        
        <LoginForm />
        
        <div className="mt-8 text-center text-xs text-gray-400">
          <p>ระบบนี้สำหรับเจ้าหน้าที่หน่วยงานเท่านั้น</p>
          <p>ไม่อนุญาตให้บุคคลภายนอกเข้าถึงข้อมูล</p>
        </div>
      </div>
    </div>
  )
}
