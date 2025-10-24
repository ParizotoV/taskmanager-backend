export type SignInInputDto = {
  email: string;
  password: string;
}

export type SignInOutputDto = {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}
