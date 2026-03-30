package com.yourcompany.scheduler.web.filter;

import javax.servlet.*;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * React 개발 서버(localhost:5173)에서의 API 호출을 허용하는 CORS 필터.
 * web.xml에 등록하거나 Spring Bean으로 등록한다.
 *
 * web.xml 등록 예시:
 * <filter>
 *   <filter-name>corsFilter</filter-name>
 *   <filter-class>com.yourcompany.scheduler.web.filter.CorsFilter</filter-class>
 * </filter>
 * <filter-mapping>
 *   <filter-name>corsFilter</filter-name>
 *   <url-pattern>/api/*</url-pattern>
 * </filter-mapping>
 */
public class CorsFilter implements Filter {

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {}

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        httpResponse.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
        httpResponse.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        httpResponse.setHeader("Access-Control-Allow-Headers", "Content-Type");
        chain.doFilter(request, response);
    }

    @Override
    public void destroy() {}
}
