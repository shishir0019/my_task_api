interface IMeta {
    page: number;
    limit: number;
    total: number;
}

interface IResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    meta?: IMeta;
}

interface IErrorResponse {
    success: boolean;
    message: string;
}

export const successResponse = <T = any>(data: T, meta?: IMeta): IResponse<T> => {
    return {
        success: true,
        data,
        meta
    };
};

export const errorResponse = (message: string): IErrorResponse => {
    return {
        success: false,
        message,
    };
};
