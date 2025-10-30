export interface CarouselItem {
  src: string;
  title: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface LoginPageProps {
  onSubmit?: (data: LoginFormData) => void;
  onGoogleLogin?: () => void;
}
