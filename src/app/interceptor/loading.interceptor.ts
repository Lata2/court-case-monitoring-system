import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/loading.service'; // 👈 apne service path ke hisaab se change karein

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  loadingService.show(); // 👈 Request start hone par loader dikhaye

  return next(req).pipe(
    finalize(() => loadingService.hide()) // 👈 Response milte hi loader band kare
  );
};
