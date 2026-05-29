import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <img src="/logo.PNG" alt="UGCLab" className="h-12 w-auto mb-5" />
            <p className="text-sm text-gray-500 leading-relaxed">
              أول منصة عراقية تربط صناع المحتوى بالمعلنين بطريقة احترافية وآمنة.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-black mb-5">روابط سريعة</h3>
            <ul className="space-y-3">
              {[
                { href: '/', label: 'الرئيسية' },
                { href: '/#features', label: 'المميزات' },
                { href: '/#how-it-works', label: 'كيف تعمل' },
                { href: '/explore', label: 'استكشف' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-500 hover:text-black transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-black mb-5">الحسابات</h3>
            <ul className="space-y-3">
              {[
                { href: '/login', label: 'تسجيل دخول' },
                { href: '/register', label: 'إنشاء حساب' },
                { href: '/register?role=creator', label: 'للراغبين في الإبداع' },
                { href: '/register?role=advertiser', label: 'للراغبين في الإعلان' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-500 hover:text-black transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-black mb-5">تواصل معنا</h3>
            <ul className="space-y-3 text-sm text-gray-500">
              <li>بغداد، العراق</li>
              <li>info@ugclab.com</li>
              <li>+964 xxx xxx xxxx</li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-gray-100 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} UGCLab. جميع الحقوق محفوظة.
        </div>
      </div>
    </footer>
  );
}
