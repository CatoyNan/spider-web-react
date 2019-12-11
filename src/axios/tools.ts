/**
 * http通用工具函数
 */
import axios from 'axios';
import { message } from 'antd';

interface IFRequestParam {
    url: string;
    msg?: string;
    config?: any;
    data?: any;
}

export const getRequest = (url:string, data:any) => {
    return axios({
      method: 'get',
      params: data, 
      url: url,
    });
}

export const postJsonRequest = (url:string,params:any) => {
    return axios({
        method:"post",
        url:url,
        data:params,
        headers:{
            'Content-Type': 'application/json',
        }
    });
}


/**
 * 公用get请求
 * @param url       接口地址
 * @param msg       接口异常提示
 * @param headers   接口所需header配置
 */
export const get = ({ url, msg = '接口异常', config }: IFRequestParam) =>
    axios
        .get(url, config)
        .then(res => res.data)
        .catch(err => {
            console.log(err);
            message.warn(msg);
        });

/**
 * 公用post请求
 * @param url       接口地址
 * @param data      接口参数
 * @param msg       接口异常提示
 * @param headers   接口所需header配置
 */
export const post = ({ url, data, msg = '接口异常', config }: IFRequestParam) =>
    axios
        .post(url, data, config)
        .then(res => res.data)
        .catch(err => {
            console.log(err);
            message.warn(msg);
        });
