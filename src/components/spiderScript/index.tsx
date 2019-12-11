import React, { Component } from 'react';
import { Row, Col, Card, Tabs, Button, Select, notification } from 'antd';
import BreadcrumbCustom from '../BreadcrumbCustom';
import AceEditor from 'react-ace';
import { TabsPosition } from 'antd/lib/tabs';
import { IconType } from 'antd/lib/notification';
import { getRequest, post } from '../../axios/tools';
import * as config from '../../../src/axios/config';

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
};

class ScriptEditor extends Component<any, TabsCustomState> {
    constructor(props: any) {
        super(props);
        var panes = [
            {
                title: 'NewTab 0',
                content: 'Content of Tab Pane 0',
                key: '0',
                code: 'public',
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
        };

        this.getAllCompilationTasksByUserId('1');
    }

    newTabIndex: number = 0;
    currentOptionIndex: number = -1;

    /**
     * 根据userId获取所有CompilationTask
     */
    getAllCompilationTasksByUserId = (userId: string) => {
        getRequest(`${config.SERVER_HOST}/compilationtask/getAllCompilationTasksByUserId`, null)
            .then(result => {
                if (result.status === 200) {
                    let data = result.data.data;
                    console.log(data);
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
        console.log('activeKye' + activeKey);
        if (pane === undefined) {
            panes.push({ title: 'title', content: 'New Tab Pane', key: activeKey });
        } else {
            var _pane = { ...pane };
            _pane.title = pane.className;
            _pane.content = 'New Tab Pane';
            _pane.key = activeKey;
            _pane.code = this.processCode(_pane,processCodeEnum.pullCode);
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
     * code处理事件
     */
    processCode = (pane: any, type: number): string => {
        let code = '';
        // push代码时对code的处理
        if (type === processCodeEnum.pushCode) {
            let reg = new RegExp('(?<=-\\scallin:).*}');
            let result = reg.exec(pane.code);
            if (result == null) {
                this.openNotificationWithIcon('error','错误：','没有定义方法入口');
                return '';
            }

            let _args = [];
            let callinStr = result[0];
            let reg2 = /(?<=[:\s]')[\w]+(?=')/g;
            var result2:any[] = [];
            var crt;
            while((crt = reg2.exec(callinStr)) !== null){
                result2.push(crt[0]);
            };
            if (result2.length === 0) {
                this.openNotificationWithIcon('error','错误：','定义方法入口格式有误');
                return '';
            }
            for (let i=0;i<result2.length;i++) {
                if (i === 0) {
                    pane.methodName = result2[i];
                } else {
                    _args.push(result2[i]);
                }
            }
            pane.args = _args;
            console.log(pane)
            return pane.code.replace('-\\scallin:.*}','');
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
    clickRun = (a: string, b: number): string => {
        return '';
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
            this.openNotificationWithIcon('info', '提示：', '请先选择脚本');
            return;
        }
        this.add(array[this.currentOptionIndex]);
    };

    /**
     * 点击push事件
     */
    clickPush = () => {
        var _pane;
        this.state.panes.map((val:any,key:string) =>{
            if (this.state.activeKey === val.key) {
                _pane = {...val};
                let code = this.processCode(_pane,processCodeEnum.pushCode);
                if (code.length>0) {
                    _pane.code = code;
                }
            } 
            return key;
        }); 
        console.log(_pane)
    }

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
                <BreadcrumbCustom first="UI" second="富文本" />
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
                                                // onClick={this.add}
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
                                                height={'500px'}
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
                                                height={'100px'}
                                                fontSize={10}
                                                showPrintMargin={false}
                                                value={pane.code}
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
                    <Col className="gutter-row" md={8}>
                        <div className="gutter-box">
                            <Card title="带删除和新增" bordered={false}>
                                <div style={{ marginBottom: 16 }}>
                                    {/* <Button onClick={this.add}>ADD</Button> */}
                                </div>
                                <Tabs
                                    hideAdd
                                    // onChange={this.onChange}
                                    activeKey={this.state.activeKey}
                                    type="editable-card"
                                    onEdit={this.onEdit}
                                >
                                    {this.state.panes.map((pane: any) => (
                                        <TabPane tab={pane.title} key={pane.key}>
                                            <AceEditor
                                                placeholder="Placeholder Text"
                                                mode="java"
                                                theme="monokai"
                                                name="blah2"
                                                // onLoad={this.onLoad}
                                                // onChange={this.onChange}
                                                width={'60'}
                                                fontSize={14}
                                                showPrintMargin={false}
                                                // showGutter={false}
                                                // highlightActiveLine={false}
                                                value={'123'}
                                                setOptions={{
                                                    enableBasicAutocompletion: true,
                                                    enableLiveAutocompletion: true,
                                                    enableSnippets: false,
                                                    showLineNumbers: true,
                                                    tabSize: 2,
                                                }}
                                            />
                                        </TabPane>
                                    ))}
                                </Tabs>
                            </Card>
                        </div>
                    </Col>
                    <Col className="gutter-row" md={8}>
                        <div className="gutter-box">
                            <Card title="带删除和新增" bordered={false}>
                                <Tabs
                                    hideAdd
                                    // onChange={this.onChange}
                                    activeKey={this.state.activeKey}
                                    type="editable-card"
                                    onEdit={this.onEdit}
                                >
                                    <TabPane tab="Tab 1" key="1">
                                        Content of Tab Pane 1
                                    </TabPane>
                                </Tabs>
                            </Card>
                        </div>
                    </Col>
                    <Col className="gutter-row" md={8}>
                        <Card title="同步转换JSON" bordered={false}>
                            <pre style={{ whiteSpace: 'normal' }}>{JSON.stringify('')}</pre>
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default ScriptEditor;
