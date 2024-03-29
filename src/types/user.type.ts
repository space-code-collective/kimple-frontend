import { Base } from './base.type';

export type User = Base & {
	username: string;
	createdAt: string;
};

export type Credentials = {
	username: string;
	password: string;
};

export type Token = {
	token: string;
};
