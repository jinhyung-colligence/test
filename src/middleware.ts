import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 로그인 페이지와 정적 파일들은 인증 체크 건너뛰기
  if (
    pathname === '/login' ||
    pathname.startsWith('/login/blocked') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // 정적 파일들 (css, js, images 등)
  ) {
    return NextResponse.next()
  }

  // 쿠키에서 인증 상태 확인
  const authSession = request.cookies.get('auth_session')?.value

  if (!authSession) {
    // 인증되지 않은 사용자는 로그인 페이지로 리다이렉트
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  try {
    // 세션 유효성 검사
    const { timestamp } = JSON.parse(authSession)
    const now = Date.now()
    const thirtyMinutes = 30 * 60 * 1000

    if (now - timestamp > thirtyMinutes) {
      // 세션 만료된 경우 로그인 페이지로 리다이렉트
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('auth_session')
      return response
    }
  } catch {
    // 잘못된 세션 데이터인 경우 로그인 페이지로 리다이렉트
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('auth_session')
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * 다음을 제외한 모든 경로에 매칭:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - 정적 파일들 (png, jpg, jpeg, gif, svg, css, js)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|css|js|ico|webp)$).*)'
  ]
}