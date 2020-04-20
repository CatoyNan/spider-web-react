import React, { PureComponent } from 'react'
import {
    Card,
    Input,
    Icon,
    Button,
    message,
    Form,
    List,
    Select, Row, Col, Tabs, notification
} from 'antd'
import SimpleTable from './SimpleTable'
import SimpleModalButton from '../simple-modal-button'
import BreadcrumbCustom from "../BreadcrumbCustom";
import { getRequest, postJsonRequest } from '../../axios/tools';
import * as config from "../../axios/config";
import {IconType} from "antd/lib/notification";
const { Option } = Select;

class SpiderTask extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            selectedRows: [],//选中行
            jobs: {},//退款数据
            loading: false,//加载状态
            filteredInfo: null,//筛选信息
            sortedInfo: null,//排序信息
            searchParams:{},//查询退款记录的参数
            resource: {},//资源列表
            formData: {}, //modal数据
            compilationTasks: []
        }

        this.setEditFormRef = element => {
            this.editForm = element;
        };
        this.setAddFormRef = element => {
            this.addForm = element;
        };
        this.getAllCompilationTasksByUserId('1');
    }

    /**
     * 提示框
     */
    openNotificationWithIcon = (type, title, msg) => {
        notification[type]({
            message: title,
            description: msg,
        });
    };

    /**
     * 组件将要卸载
     * 去除所有的请求和计时器
     */
    componentWillUnmount = () => {
        this.setState = (state,callback)=>{
            return;
        };
    }

    /**
     * 组件已经挂载
     */
    componentDidMount() {
        // this.getResource();
        let parms = {
            pageNum: 1,
            pageSize: 10
        };
        this.queryjob(parms);
    }

    /**
     * 获取页面需要的资源列表
     */
    // getResource = async () => {
    //     let needResourcesList = ['transferCompanyList','dispatchCountryList'];
    //     let parms = {
    //         needResourcesList: needResourcesList,
    //         path: this.props.pane.key
    //     }
    //     await getResources(parms).then((data) => {
    //         if (typeof data.success !== 'undefined' && data.success === false ) {
    //             message.error("获取资源列表：" + data.message);
    //         } else {
    //             this.setState({resource:data})
    //         }
    //     })
    // }

    /**
     * 获取job
     * @param params
     */
    queryjob = async (params) => {
        this.clearSelectedRows();
        this.setState({loading:true});
        getRequest(`${config.SERVER_HOST}/job/queryjob`, params)
            .then(result => {
                if (result.status === 200) {
                    let data = result.data.taskDtoPageInfo;
                    this.setState({ jobs: data });
                }
            })
            .catch(err => {});
        this.setState({loading:false});
    }


    /**
     * 编辑选中行
     */
    // updateSelectedRow = async () => {
    //     let {formData,searchParams} = this.state;
    //     updateTransferCompanyPriceInfoById(formData).then((data)=>{
    //         if (typeof data.success !== 'undefined' && data.success === true) {
    //             message.success(data.message);
    //             this.getTransferCompanyPriceInfoByCondition(searchParams);
    //         } else {
    //             message.error(data.message);
    //         }
    //     })
    //     this.clearFormData();
    // }

    /**
     * 增加一条记录
     */
    // addTransferCompanyPriceInfo = async () => {
    //     let {formData,searchParams} = this.state;
    //     addTransferCompanyPriceInfo(formData).then((data)=>{
    //         if (typeof data.success !== 'undefined' && data.success === true) {
    //             message.success(data.message);
    //             this.getTransferCompanyPriceInfoByCondition(searchParams);
    //         } else {
    //             message.error(data.message);
    //         }
    //     })
    //     this.clearFormData();
    // }

    /**
     * 根据userId获取所有CompilationTask
     */
    getAllCompilationTasksByUserId = (userId) => {
        getRequest(`${config.SERVER_HOST}/task/getAllCompilationTasksByUserId`, {'id':'1'})
            .then(result => {
                if (result.status === 200) {
                    let data = result.data.data;
                    this.setState({ compilationTasks: data });
                    // this.setState({panes:result.data.data})
                }
            })
            .catch(err => {});
    };

    /**
     * 新增任务
     */
    addJob = () => {
        let {formData} = this.state;
        postJsonRequest(`${config.SERVER_HOST}/job/addjob`,formData)
            .then(result => {
                if (result.status === 200) {
                    let status = result.data.status;
                    console.log(result.data.data)
                    if (status === 2002 || status === 2000) {
                        this.openNotificationWithIcon('success', '成功：', '操作成功');
                    } else {
                        console.log(1);
                        this.openNotificationWithIcon('error', '错误：', '未知错误');
                    }
                } else {
                    console.log(2)
                    this.openNotificationWithIcon('error', '错误：', '未知错误');
                }
            })
            .catch(err => {
                console.log(3)
                this.openNotificationWithIcon('error', '错误：', '未知错误');
            });
    }
    /**
     * 清除筛选条件
     */
    clearFilters = () => {
        this.setState({ filteredInfo: null,sortedInfo: null,searchParams:{}});
    };

    /**
     * 清除选中的行
     */
    clearSelectedRows = () => {
        this.setState({selectedRows:[]})
    }

    /**
     * 清除formData
     */
    clearFormData = () => {
        this.setState({formData:{}})
    }

    getColumnSearchProps = dataIndex => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters}) => (
            <div style={{ padding: 8 }}>
                <Input
                    ref={node => {
                        this.searchInput = node
                    }}
                    placeholder={`Search ${dataIndex}`}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value.trim()] : [])}
                    onPressEnter={() => {confirm()}}
                    style={{ width: 188, marginBottom: 8, display: 'block' }}
                />
                <Button
                    type="primary"
                    onClick={() => {confirm()}}
                    icon="search"
                    size="small"
                    style={{ width: 90, marginRight: 8 }}
                >
                    Search
                </Button>
                <Button
                    onClick={() => {clearFilters()}}
                    size="small"
                    style={{ width: 90 }}
                >
                    Reset
                </Button>
            </div>
        ),
        filterIcon: filtered => (
            <Icon type="search" style={{ color: filtered ? '#1890ff' : undefined }} />
        ),
        onFilterDropdownVisibleChange: visible => {
            if (visible) {
                setTimeout(() => this.searchInput.select())
            }
        },
    })

    /**
     * 选中行触发
     * @param rows 行数据
     */
    handleSelectRows = rows => {
        this.setState({
            selectedRows: rows,
        })

    }

    /**
     * 表格change事件
     * @param pagination 分页对象
     * @param filtersArg 筛选参数
     * @param sorter
     */
    // handleSimpleTableChange = (pagination, filtersArg, sorter) => {
    //     this.setState({ filteredInfo: filtersArg,sortedInfo: sorter });
    //
    //     //格式转换 eg:{status:[1],order:[3601]} => {status:1,order:3601}
    //     const filters = Object.keys(filtersArg).reduce((obj, key) => {
    //         const newObj = { ...obj };
    //         let array = filtersArg[key];
    //         if (array !== null) {
    //             let str = array[0];//单选模式，只取第0个元素
    //             if (typeof str !== 'undefined' && str.length > 0) {
    //                 newObj[key] = str;
    //             }
    //         }
    //         return newObj;
    //     }, {});
    //
    //     //格式转换,配合后端接口 eg:{status:1,order:3601} => [{filed:status,op:eq,data:1},{filed:order,op:eq,data:3601}]
    //     var rules = [];
    //     for (let key in filters) {
    //         let obj = {}
    //         if (filters[key] !== null && filters[key] !== '') {
    //             obj.field = key
    //             obj.op = 'eq'
    //             obj.data = filters[key]
    //             rules.push(obj);
    //         }
    //     }
    //     const params = {
    //         pageNum: pagination.current,
    //         pageSize: pagination.pageSize,
    //     };
    //
    //     const data = this.getTransferCompanyPriceInfoByCondition(params);
    //     this.setState({transferCompanyPriceInfoData: data,searchParams:params});
    // };


    render() {
        let { filteredInfo,resource,selectedRows,formData,sortedInfo } = this.state;
        let selectedRow = {...selectedRows[0]} || {};
        filteredInfo = filteredInfo || {};
        sortedInfo = sortedInfo || {};
        const columns = [
            {
                title: '编号',
                dataIndex: 'id',
                key: 'id',
                align: 'left',
                defaultSortOrder: 'ascend',
                width:50
            },
            {
                title: '链接',
                dataIndex: 'url',
                align: 'left',
                key: 'url',
                width:200,
            },
            {
                title: '脚本名称',
                dataIndex: 'scriptName',
                align: 'left',
                key: 'scriptName',
                width: 80,
            },
            {
                title: '回调方式',
                dataIndex: 'callBack',
                align: 'left',
                key: 'callBack',
                width: 80,
                render:(callBack) => {
                    if(callBack === 0){
                        return "接口回调"
                    }else if(callBack === 1) {
                        return "邮件回调"
                    }else if(callBack === 2) {
                        return "短信回调"
                    }
                },
            },
            {
                title: 'cron表达式',
                dataIndex: 'cronExpression',
                align: 'left',
                key: 'cronExpression',
                width:60,
            },
            {
                title: '创建时间',
                align: 'left',
                dataIndex: 'gmtCreate',
                key: 'gmtCreate',
                width:150,
            },
            {
                title: '任务状态',
                dataIndex: 'taskStatus',
                align: 'left',
                key: 'taskStatus',
                width:85,
                render:(taskStatus) => {
                    if(taskStatus === 0){
                        return "运行"
                    }else if(taskStatus === 1) {
                        return "暂停"
                    }
                },
            },
            {
                title: '最近一次执行状态',
                dataIndex: 'recentStatus',
                align: 'left',
                key: 'recentStatus',
                width:85,
                render:(taskStatus) => {
                    if(taskStatus === 0){
                        return "成功"
                    }else if(taskStatus === 1) {
                        return "失败"
                    }else if(taskStatus === 2) {
                        return "超时"
                    }
                },
            },
        ];

        //编辑按钮
        let editButton = ()=>{
            return (<SimpleModalButton
                showModal={()=>{
                    if (Object.keys(selectedRow).length === 0) {
                        message.error('未选中数据')
                    } else {
                        let newFormData = {...selectedRow}
                        this.setState({formData:newFormData})
                    }
                }}
                value={'编辑任务'}
                title={'正在编辑选中'}
                onOk={()=>{this.updateSelectedRow()}}
                onCancel={()=>{this.clearFormData()}}>
                <Form
                    ref={this.setEditFormRef}
                    labelCol={{ span: 4 }}
                    wrapperCol={{ span: 14 }}
                    layout="horizontal"
                    onChange={(e)=>{
                        let newFormData = {...formData};
                        newFormData[e.target.id] = e.target.value;
                        this.setState({formData:newFormData})}
                    }
                >
                    <Form
                        ref ={this.setAddFormRef}
                        labelCol={{ span: 4 }}
                        wrapperCol={{ span: 14 }}
                        layout="horizontal"
                        onChange={(e)=>{
                            let newFormData = {...formData};
                            newFormData[e.target.id] = e.target.value;
                            this.setState({formData:newFormData})}
                        }
                    >
                        <Form.Item label="链接">
                            <Input  id={'url'} value={formData.url || null}/>
                        </Form.Item>
                        <Form.Item label="cron表达式">
                            <Input  id={'cronExpression'} value={formData.cronExpression || null}/>
                        </Form.Item>
                        <Form.Item label="脚本">
                            <Select id={'scriptId'} value={parseInt(formData.scriptId)} style={{ width: 120 }} onChange={(value)=>{
                                let target = {
                                    value: value,
                                    id: 'scriptId'
                                }
                                let obj = {
                                    target: target
                                }
                                this.addForm.props.onChange(obj)}}>
                                {this.state.compilationTasks.map(
                                    (val, key) => (
                                        <Option key={val.id} value={val.id}>
                                            {val.className}
                                        </Option>
                                    )
                                )}
                            </Select>
                        </Form.Item>
                        <Form.Item label="回调方式：">
                            <Select id={'callBack'} value={formData.callBack+''} style={{ width: 120 }} onChange={(value)=>{
                                let target = {
                                    value: value,
                                    id: 'callBack'
                                }
                                let obj = {
                                    target: target
                                }
                                this.addForm.props.onChange(obj)}}>
                                <Option value="0">接口回调</Option>
                                <Option value="1">邮件回调</Option>
                                <Option value="2">短信回调</Option>
                            </Select>
                        </Form.Item>
                    </Form>
                </Form>
            </SimpleModalButton>)
        }

        //增加按钮
        let addButton = ()=>{
            return (<SimpleModalButton
                showModal={()=>{
                }}
                value={'新增任务'}
                title={'新增任务'}
                onOk={()=>{this.addJob()}}
                onCancel={()=>{this.clearFormData()}}>
                <Form
                    ref ={this.setAddFormRef}
                    labelCol={{ span: 4 }}
                    wrapperCol={{ span: 14 }}
                    layout="horizontal"
                    onChange={(e)=>{
                        let newFormData = {...formData};
                        newFormData[e.target.id] = e.target.value;
                        this.setState({formData:newFormData})}
                    }
                >
                    <Form.Item label="链接">
                        <Input  id={'url'} value={formData.url || null}/>
                    </Form.Item>
                    <Form.Item label="cron表达式">
                        <Input  id={'cronExpression'} value={formData.cronExpression || null}/>
                    </Form.Item>
                    <Form.Item label="脚本">
                        <Select id={'scriptId'} value={formData.scriptId} style={{ width: 120 }} onChange={(value)=>{
                            let target = {
                                value: value,
                                id: 'scriptId'
                            }
                            let obj = {
                                target: target
                            }
                            this.addForm.props.onChange(obj)}}>
                            {this.state.compilationTasks.map(
                                (val, key) => (
                                    <Option key={key} value={val.id}>
                                        {val.className}
                                    </Option>
                                )
                            )}
                        </Select>
                    </Form.Item>
                    <Form.Item label="回调方式：">
                        <Select id={'callBack'} value={formData.callBack} style={{ width: 120 }} onChange={(value)=>{
                            let target = {
                                value: value,
                                id: 'callBack'
                            }
                            let obj = {
                                target: target
                            }
                            this.addForm.props.onChange(obj)}}>
                            <Option value="0">接口回调</Option>
                            <Option value="1">邮件回调</Option>
                            <Option value="2">短信回调</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </SimpleModalButton>)
        }

        //删除任务按钮
        let deleteJobButton = ()=>{
            return (
                <Button onClick={() => {
                    if (Object.keys(selectedRow).length === 0) {
                        message.error('未选中数据')
                    } else {
                        getRequest(`${config.SERVER_HOST}/job/deletejob`, {'jobGroupName':selectedRow.jobGroup})
                            .then(result => {
                                if (result.status === 200) {
                                    let status = result.data.status;
                                    if (status === 2002 || status === 2000) {
                                        this.openNotificationWithIcon('success', '成功：', '操作成功');
                                    } else {
                                        this.openNotificationWithIcon('error', '错误：', '未知错误');
                                    }
                                } else {
                                    this.openNotificationWithIcon('error', '错误：', '未知错误');
                                }
                            })
                            .catch(err => {});
                    }
                }}>
                    删除任务
                </Button>
            );
        }

        //暂停任务按钮
        let pauseJobButton = ()=>{
            return (
                <Button onClick={() => {
                    if (Object.keys(selectedRow).length === 0) {
                        message.error('未选中数据')
                    } else {
                        getRequest(`${config.SERVER_HOST}/job/pausejob`, {'jobGroupName':selectedRow.jobGroup})
                            .then(result => {
                                console.log(result)
                                if (result.status === 200) {
                                    let status = result.data.status;
                                    if (status === 2002 || status === 2000) {
                                        this.openNotificationWithIcon('success', '成功：', '操作成功');
                                        console.log('openNotificationWithIcon')
                                    } else {
                                        this.openNotificationWithIcon('error', '错误：', '未知错误');
                                    }
                                } else {
                                    this.openNotificationWithIcon('error', '错误：', '未知错误');
                                }
                            })
                            .catch(err => {
                                console.log(err)
                            });
                    }
                }}>
                    暂停任务
                </Button>
            );
        }

        //恢复任务按钮
        let resumeJobButton = ()=>{
            return (
                <Button onClick={() => {
                    if (Object.keys(selectedRow).length === 0) {
                        message.error('未选中数据')
                    } else {
                        getRequest(`${config.SERVER_HOST}/job/resumejob`, {'jobGroupName':selectedRow.jobGroup})
                            .then(result => {
                                if (result.status === 200) {
                                    let status = result.data.status;
                                    if (status === 2002 || status === 2000) {
                                        this.openNotificationWithIcon('success', '成功：', '操作成功');
                                    } else {
                                        this.openNotificationWithIcon('error', '错误：', '未知错误');
                                    }
                                } else {
                                    this.openNotificationWithIcon('error', '错误：', '未知错误');
                                }
                            })
                            .catch(err => {});
                    }
                }}>
                    恢复任务
                </Button>
            );
        }

        return (
            <div className="main">
                <BreadcrumbCustom first="任务发布"/>
                <Row gutter={16}>
                    <Col className="gutter-row" md={24}>
                        <div className="gutter-box">
                            <Card title={'发布列表'} bordered={false}>
                                <div>
                                    <Button style={{ marginLeft: 8,marginBottom:24 }} onClick={()=>{
                                        this.clearFilters();
                                        let parms = {
                                            pageNum: 1,
                                            pageSize: 10
                                        };
                                        this.queryjob(parms);
                                    }}>刷新</Button>
                                    <div style={{ float: 'right', marginBottom: 24 }}>
                                        {/*增加按钮*/}
                                        {addButton()}
                                        {/*编辑按钮*/}
                                        {editButton()}
                                        {/*删除任务按钮*/}
                                        {deleteJobButton()}
                                        {/*暂停任务按钮*/}
                                        {pauseJobButton()}
                                        {/*回复任务按钮*/}
                                        {resumeJobButton()}
                                    </div>
                                    <SimpleTable
                                        selectedRows={this.state.selectedRows}
                                        isShowRowSelection={true}
                                        size='middle'
                                        scroll={{x:100,y:400}}
                                        loading={this.state.loading}
                                        columns={columns}
                                        onSelectRow={this.handleSelectRows}
                                        rowKey={(record, index) => index}
                                        onChange={this.handleSimpleTableChange}
                                        data={this.state.jobs}
                                    />
                                </div>
                            </Card>
                        </div>
                    </Col>
                </Row>
            </div>

        )
    }
}

export default SpiderTask;
