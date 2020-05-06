import React, { Component } from 'react';
import { Row, Col, Card, Tabs, Button, Select, notification } from 'antd';
import BreadcrumbCustom from '../BreadcrumbCustom';
import AceEditor from 'react-ace';
import { TabsPosition } from 'antd/lib/tabs';
import { IconType } from 'antd/lib/notification';
import { getRequest, postJsonRequest } from '../../axios/tools';
import * as config from '../../../src/axios/config';
import JSONPretty from 'react-json-pretty';

import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import 'ace-builds/src-noconflict/mode-java';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/snippets/java';

const { Option } = Select;
const TabPane = Tabs.TabPane;

// 枚举处理code的方式
enum processCodeEnum {
    pullCode = 0, //pull code时对code的处理
    pushCode = 1, //push code时对coder的处理
}

type TabsCustomState = {
    activeKey: string;
    panes: any;
    mode: TabsPosition;
    compilationTasks: any[];
    resultData: string;
};

class ScriptEditor extends Component<any, TabsCustomState> {
    constructor(props: any) {
        super(props);
        var panes = [
            {
                title: 'NewTab 0',
                content: 'Content of Tab Pane 0',
                key: '0',
                code: '',
                args: ['1', '2'],
                methodName: 'run',
                className: 'Hello.java',
            },
        ];
        this.state = {
            activeKey: panes[0].key,
            panes: panes,
            mode: 'top',
            compilationTasks: [],
            resultData: ''
        };

        this.getAllCompilationTasksByUserId('1');
    }

    newTabIndex: number = 0;
    currentOptionIndex: number = -1;

    /**
     * 根据userId获取所有CompilationTask
     */
    getAllCompilationTasksByUserId = (userId: string) => {
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
     * 增加一个编辑器页面
     */
    add = (pane?: any) => {
        const panes = this.state.panes;
        const activeKey = '' + ++this.newTabIndex;
        if (pane === undefined) {
            panes.push({ title: 'title', content: 'New Tab Pane', key: activeKey });
        } else {
            var _pane = { ...pane };
            _pane.title = pane.className;
            _pane.content = 'New Tab Pane';
            _pane.key = activeKey;
            _pane.code = this.processCode(_pane, processCodeEnum.pullCode);
            panes.push(_pane);
        }
        this.setState({ panes: panes, activeKey: activeKey }, function(this: any) {});
    };

    /**
     * tab改变事件
     */
    tabOnChange = (activeKey: string) => {
        this.setState({ activeKey });
    };

    /**
     * tab编辑事件
     */
    onEdit = (targetKey: string | React.MouseEvent<HTMLElement>, action: 'add' | 'remove') => {
        this[action](targetKey as string);
    };

    /**
     * tab删除节点事件
     */
    remove = (targetKey: string) => {
        let activeKey = this.state.activeKey;
        let lastIndex = 0;
        this.state.panes.forEach((pane: any, i: number) => {
            if (pane.key === targetKey) {
                lastIndex = i - 1;
            }
        });
        const panes = this.state.panes.filter((pane: any) => pane.key !== targetKey);
        if (lastIndex >= 0 && activeKey === targetKey) {
            activeKey = panes[lastIndex].key;
        }
        this.setState({ panes, activeKey });
    };

    /**
     * 编辑器修改事件
     */
    editorOnChange = (code: string, event: any, key: string) => {
        var panes = this.state.panes;
        for (let i = 0; i < panes.length; i++) {
            if (panes[i].key === key) {
                panes[i].code = code;
                break;
            }
        }
        this.setState({ panes });
    };

    /**
     * option修改事件
     */
    optionChange = (val: any, option: any) => {
        this.currentOptionIndex = val;
    };

    /**
     * code文本处理
     */
    processCode = (pane: any, type: number): string => {
        if (pane.code.length === 0) {
            this.openNotificationWithIcon('info', '提示：', '文本内容不能为空');
            return '';
        }
        let code = '';
        // push代码时对code的处理
        if (type === processCodeEnum.pushCode) {
            let reg = new RegExp('(?<=-\\scallin:).*}');
            let result = reg.exec(pane.code);
            if (result == null) {
                this.openNotificationWithIcon('error', '错误：', '没有定义方法入口');
                return '';
            }
            // 获取methodName 和 args
            let _args = [];
            let callinStr = result[0];
            let reg2 = /(?<=[:\s]["']).*?(?=["'])/g;
            var result2: any[] = [];
            var crt;
            while ((crt = reg2.exec(callinStr)) !== null) {
                result2.push(crt[0]);
            }
            console.log('result2')
            console.log(result2)
            if (result2.length === 0) {
                this.openNotificationWithIcon('error', '错误：', '定义方法入口格式有误');
                return '';
            }
            for (let i = 0; i < result2.length; i++) {
                if (i === 0) {
                    pane.methodName = result2[i];
                } else {
                    _args.push(result2[i]);
                }
            }
            pane.args = _args;

            // 获取全限定类名
            let reg3 = new RegExp('(?<=package\\s).*(?=;)');
            let packageName = reg3.exec(pane.code);
            if (packageName == null) {
                this.openNotificationWithIcon('error', '错误：', '没有定义包名');
                return '';
            }
            let reg4 = new RegExp('(?<=public\\sclass\\s)[A-Z]\\w*(?=[\\s{])');
            let _className = reg4.exec(pane.code);
            if (_className == null) {
                this.openNotificationWithIcon('error', '错误：', '无法获取类名');
                return '';
            }
            pane.className = packageName[0] + '.' + _className[0] + '.java';

            // 返回去除‘-callin..’片段的code
            return pane.code.replace(/(-[\s]*callin:.*}[;]*)/g, '');
        }
        // pull代码时对code对处理
        else {
            // let className = pane.className;
            let _args = pane.args;
            let _methodName = pane.methodName;
            let segment: string = "- callin: {seg:'" + _methodName + "',";
            for (let i = 0; i < _args.length; i++) {
                segment = segment + i + ": '" + _args[i] + "',";
            }
            segment = segment.substring(0, segment.length - 1) + '};';
            code = pane.code + '\n\n' + segment;
            return code;
        }
    };

    /**
     * 点击run事件
     */
    clickRun = () => {
        var _pane;
        var flag = true;
        this.state.panes.map((val: any, key: string) => {
            if (this.state.activeKey === val.key) {
                _pane = { ...val };
                let code = this.processCode(_pane, processCodeEnum.pushCode);
                if (code.length > 0) {
                    _pane.code = code;
                    flag = false;
                }
            }
            return key;
        });
        if(flag){
            return;
        }
        postJsonRequest(`${config.SERVER_HOST}/task/execute`, _pane)
            .then(result => {
                console.log(0)
                if (result.status === 200) {
                    let status = result.data.status;
                    console.log(result.data.data)
                    if (status === 2002 || status === 2000) {
                        let errorMsg = result.data.data.errorMsg;
                        let resultPrint = result.data.data.resultPrint;
                        let isCompileSuccess = result.data.data.compileSuccess;
                        let isInvokeSuccess = result.data.data.invokeSuccess;
                        let resultData = result.data.data.resultData;
                        var _panes = this.state.panes;
                        if(isCompileSuccess && isInvokeSuccess){
                            let var1 = "/**\n" +
                            " * 执行成功\n" +
                            " **/\n"
                            errorMsg = var1 + resultPrint + "\n" + (errorMsg == null?"":errorMsg);
                        }
                        _panes.map((val: any, key: string) => {
                            if (this.state.activeKey === val.key) {
                                val.errorMsg = errorMsg;
                                this.setState({panes:_panes,resultData:resultData});
                            }
                            return key;
                        });
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
    };

    /**
     * 点击pull事件
     */
    clickPull = () => {
        var array = this.state.compilationTasks;
        if (array === null || array.length === 0) {
            this.openNotificationWithIcon('info', '提示：', '暂无脚本');
            return;
        }

        if (this.currentOptionIndex === -1) {
            this.openNotificationWithIcon('info', '提示：', '请先');
            return;
        }
        this.add(array[this.currentOptionIndex]);
    };

    /**
     * 点击push事件
     */
    clickPush = () => {
        var _pane;
        var flag = true;
        this.state.panes.map((val: any, key: string) => {
            if (this.state.activeKey === val.key) {
                _pane = { ...val };
                let code = this.processCode(_pane, processCodeEnum.pushCode);
                if (code.length > 0) {
                    _pane.code = code;
                    flag = false;
                }
            }
            return key;
        });
        if(flag){
            return;
        }
        postJsonRequest(`${config.SERVER_HOST}/task/push`, _pane)
            .then(result => {
                console.log(0)
                if (result.status === 200) {
                    let status = result.data.status;
                    if (status === 2002 || status === 2000) {
                        this.openNotificationWithIcon('success', '成功：', 'push成功');
                    } else {
                        console.log(1);
                        this.openNotificationWithIcon('error', '错误：', 'push失败');
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
    };

    /**
     * 提示框
     */
    openNotificationWithIcon = (type: IconType, title: string, msg: string) => {
        notification[type]({
            message: title,
            description: msg,
        });
    };

    render() {
        return (
            <div className="main">
                <BreadcrumbCustom second="编辑器" />
                <Row gutter={16}>
                    <Col className="gutter-row" md={24}>
                        <div className="gutter-box">
                            <Card title="编辑器" bordered={false}>
                                <div style={{ marginBottom: 16 }}>
                                    <Row gutter={32}>
                                        <Col md={20}>
                                            <Button
                                                onClick={() => {
                                                    this.add();
                                                }}
                                                type={'primary'}
                                            >
                                                ADD
                                            </Button>
                                            <Button onClick={this.clickPull} type={'primary'}>
                                                PULL
                                            </Button>
                                            <Button onClick={this.clickPush} type={'primary'}>
                                                PUSH
                                            </Button>
                                            <Button
                                                // onClick={this.add}
                                                type={'primary'}
                                                style={{
                                                    background: '#e74c3c',
                                                    borderColor: '#e74c3c',
                                                    color: '#fff',
                                                }}
                                            >
                                                DEL
                                            </Button>
                                            <Button
                                                onClick={this.clickRun}
                                                style={{
                                                    background: '#2ecc71',
                                                    borderColor: '#2ecc71',
                                                    color: '#fff',
                                                }}
                                            >
                                                RUN
                                            </Button>
                                        </Col>
                                        <Col md={4}>
                                            <Select
                                                defaultValue="选择脚本"
                                                style={{ width: 120 }}
                                                onChange={(val: any, option: any) => {
                                                    this.optionChange(val, option);
                                                }}
                                            >
                                                {this.state.compilationTasks.map(
                                                    (val: any, key: number) => (
                                                        <Option key={val.id} value={key}>
                                                            {val.className}
                                                        </Option>
                                                    )
                                                )}
                                            </Select>
                                        </Col>
                                    </Row>
                                </div>
                                <Tabs
                                    hideAdd
                                    onChange={this.tabOnChange}
                                    activeKey={this.state.activeKey}
                                    type="editable-card"
                                    onEdit={this.onEdit}
                                >
                                    {this.state.panes.map((pane: any) => (
                                        <TabPane tab={pane.title} key={pane.key}>
                                            <AceEditor
                                                placeholder={'hello world'}
                                                mode="java"
                                                theme="monokai"
                                                name="blah2"
                                                // onLoad={this.onLoad}
                                                onChange={(vue, event) => {
                                                    this.editorOnChange(vue, event, pane.key);
                                                }}
                                                width={'1500px'}
                                                height={'450px'}
                                                fontSize={14}
                                                showPrintMargin={false}
                                                // showGutter={false}
                                                // highlightActiveLine={false}
                                                value={pane.code}
                                                setOptions={{
                                                    enableBasicAutocompletion: true,
                                                    enableLiveAutocompletion: true,
                                                    enableSnippets: false,
                                                    showLineNumbers: true,
                                                    tabSize: 2,
                                                }}
                                            />
                                            <AceEditor
                                                theme="github"
                                                mode="java"
                                                name="blah2"
                                                width={'1500px'}
                                                height={'200px'}
                                                fontSize={10}
                                                showPrintMargin={false}
                                                value={pane.errorMsg?pane.errorMsg:''}
                                                style={{ color: 'red' }}
                                                readOnly
                                                setOptions={{
                                                    showLineNumbers: false,
                                                    tabSize: 2,
                                                }}
                                            />
                                        </TabPane>
                                    ))}
                                </Tabs>
                            </Card>
                        </div>
                    </Col>
                    <Col className="gutter-row" md={24}>
                        <Card title="同步转换JSON" bordered={false}>
                            {/* <pre style={{ whiteSpace: 'normal' }}>{(this.state.resultData,null)}</pre> */}
                            <JSONPretty id="json-pretty" data={this.state.resultData} />
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default ScriptEditor;
