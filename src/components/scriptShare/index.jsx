import React, { Component } from 'react';

import {List, Avatar, Row, Col, Card, Icon, Modal} from 'antd';
import BreadcrumbCustom from "../BreadcrumbCustom";
import AceEditor from "react-ace";

class ScriptShare extends Component {

    constructor(props) {
        super(props);
        this.state = {
            listData: [],
            showCode:false
        }
    }

    render() {
        let listData = this.state.listData;
        for (let i = 0; i < 23; i++) {
            listData.push({
                href: '',
                title: `知乎爬取热搜 ${i}`,
                avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
                heart: 0,
                share: 0,
                watch: 0,
                description:
                    '知乎, 热搜, 新闻',
                content:
                    '脚本使用cookie进行登入，若cookie过期将使用账户密码登入，脚本入口参数为url链接，爬取字段为标题、链接、图片、内容。',
            });
        }

        let IconText = ({ icon, text, item }) => (
            <div>
                <Icon onClick={() => {
                    if (icon == 'share-alt') {
                        item.share = item.share + 1
                    } else if (icon == 'heart') {
                        item.heart = item.heart + 1
                    } else {
                        item.watch = item.watch + 1
                        this.setState({showCode:true})
                    }
                    let newItem = {...item}
                    this.setState({item:newItem})
                }} style={{fontSize:'22px'}} type={icon} className="text-2x text-info" />
                {text}
            </div>
        );
        return(
            <div className="main">
                <BreadcrumbCustom first="脚本社区"/>
                <Row gutter={16}>
                    <Col className="gutter-row" md={24}>
                        <div className="gutter-box">
                            <Card title={'脚本社区'} bordered={false}>
                                <div>
                                    <List
                                        itemLayout="vertical"
                                        size="large"
                                        pagination={{
                                            onChange: page => {
                                                console.log(page);
                                            },
                                            pageSize: 3,
                                        }}
                                        dataSource={listData}
                                        footer={
                                            <div>
                                            </div>
                                        }
                                        renderItem={item => (
                                            <List.Item
                                                key={item.title}
                                                actions={[
                                                    <IconText item={item} icon={'share-alt'} text={item.share} key="list-vertical-star-o" />,
                                                    <IconText item={item} icon={'heart'} text={item.heart} key="list-vertical-like-o" />,
                                                    <IconText item={item} icon={'eye'} text={item.watch} key="list-vertical-message" />,
                                                ]}
                                                extra={
                                                    <img
                                                        width={272}
                                                        alt="logo"
                                                        src="https://dss0.baidu.com/6ONWsjip0QIZ8tyhnq/it/u=4279321293,1225512295&fm=85&app=92&f=PNG?w=121&h=75&s=54B74A7E4CE101070F227D980300009B"
                                                    />
                                                }
                                            >
                                                <List.Item.Meta
                                                    avatar={<Avatar src={item.avatar} />}
                                                    title={<a href={item.href}>{item.title}</a>}
                                                    description={item.description}
                                                />
                                                {item.content}
                                            </List.Item>
                                        )}
                                    />
                                </div>
                            </Card>
                        </div>
                    </Col>
                </Row>
                <Modal
                    title={this.props.title || 'zhiHuHot'}
                    visible={this.state.showCode}
                    onOk={()=>{this.setState({showCode:false})}}
                    onCancel={()=>{this.setState({showCode:false})}}
                    width={1000}
                >
                    <AceEditor
                        theme="github"
                        mode="java"
                        name="blah2"
                        width={'900px'}
                        height={'200px'}
                        fontSize={10}
                        showPrintMargin={false}
                        value={"package com.catoy.topp;\n" +
                        "import java.util.HashMap;\n" +
                        "import java.util.Map;\n" +
                        "import java.util.*;\n" +
                        "import top.catoy.scriptExecution.util.ClassUtil;\n" +
                        "import top.catoy.spider.DefaultBroswer;\n" +
                        "import org.openqa.selenium.*;\n" +
                        "import top.catoy.spider.Broswer;\n" +
                        "import org.openqa.selenium.support.ui.ExpectedConditions;\n" +
                        "public class SpiderTest{\n" +
                        " /**\n" +
                        " * 主入口\n" +
                        " **/\n" +
                        "  public List<Result> calculate(String data){\n" +
                        "   Broswer defaultBroswer = DefaultBroswer.init();\n" +
                        "        defaultBroswer.setUrl(\"https://www.zhihu.com/hot\").get()\n" +
                        "                                                          .getWebDriverWait().until(ExpectedConditions.presenceOfElementLocated(By.cssSelector(\"div#root\")));\n" +
                        "        System.out.println(\"正在使用cookie进行登入\");\n" +
                        "        defaultBroswer.setCookie(\"z_c0=2|1:0|10:1586685572|4:z_c0|92:Mi4xOExtckJRQUFBQUFBSU55YVVvZ2JFU1lBQUFCZ0FsVk5oRFNBWHdCMGlXUDFiZ2o2elJLYTdWWU9jNU9hUUFkUDZB|489d4fc41438f30abeee3a82b3af0d7c4cb393932e67a0cebf59a620cb651000\",\".zhihu.com\",\"/\").get();\n" +
                        "        System.out.println(\"判断是否登入\");\n" +
                        "        if (defaultBroswer.isExist(\"div.SignContainer-content\")) {\n" +
                        "            System.out.println(\"cookie登入失败\");\n" +
                        "            System.out.println(\"正在使用账户密码登入\");\n" +
                        "            if (defaultBroswer.isExist(\"div.SignFlow-tabs\")){\n" +
                        "                List<WebElement> tab = defaultBroswer.cssSelector(\"div.SignFlow-tabs div.SignFlow-tab\");\n" +
                        "                for (WebElement webElement:tab) {\n" +
                        "                    if (\"密码登录\".equals(webElement.getText())) {\n" +
                        "                        webElement.click();\n" +
                        "                        WebElement userNameInput = defaultBroswer.cssSelectorOne(\"input[name=username]\");\n" +
                        "                        WebElement passwordInput = defaultBroswer.cssSelectorOne(\"input[name=password]\");\n" +
                        "                        WebElement loginButton = defaultBroswer.cssSelectorOne(\"button[type=submit]\");\n" +
                        "                        userNameInput.clear();\n" +
                        "                        userNameInput.sendKeys(\"17858906105\");\n" +
                        "                        passwordInput.clear();\n" +
                        "                        passwordInput.sendKeys(\"ffdsd4564545\");\n" +
                        "                        loginButton.click();\n" +
                        "                        if ( defaultBroswer.isExist(\"div.Captcha-chineseOperator\")) {\n" +
                        "                            System.out.println(\"遇到验证码\");\n" +
                        "                            defaultBroswer.close();\n" +
                        "                        }\n" +
                        "                    }\n" +
                        "                }\n" +
                        "            }\n" +
                        "        }\n" +
                        "\n" +
                        "        if (!defaultBroswer.isExist(\"div.Topstory-mainColumnCard nav.TopstoryTabs a\")) {\n" +
                        "            defaultBroswer.close();\n" +
                        "            System.out.println(\"不存在标签页\");\n" +
                        "        }\n" +
                        "\n" +
                        "        List<WebElement> tabs = defaultBroswer.cssSelector(\"div.Topstory-mainColumnCard nav.TopstoryTabs a\");\n" +
                        "        for (WebElement element:tabs) {\n" +
                        "            if (element != null && \"热榜\".equals(element.getText())) {\n" +
                        "                element.click();\n" +
                        "                System.out.println(\"切换到热榜\");\n" +
                        "            }\n" +
                        "        }\n" +
                        "\n" +
                        "        if (!defaultBroswer.isExist(\"div.HotList-list section\")) {\n" +
                        "            defaultBroswer.close();\n" +
                        "            System.out.println(\"没有数据\");\n" +
                        "        }\n" +
                        "\n" +
                        "        List<Result> resultList = new ArrayList();\n" +
                        "        List<WebElement> selections = defaultBroswer.cssSelector(\"div.HotList-list section\");\n" +
                        "        for (WebElement element:selections) {\n" +
                        "            String id = defaultBroswer.cssSelectorOne(\"div.HotItem-rank\", element).getText();\n" +
                        "            String href = defaultBroswer.cssSelectorOne(\"div.HotItem-content a\",element).getAttribute(\"href\");\n" +
                        "            String title = defaultBroswer.cssSelectorOne(\"div.HotItem-content a\",element).getAttribute(\"title\");\n" +
                        "            String content = defaultBroswer.isExist(\"div.HotItem-content a p\",element)?\n" +
                        "                    defaultBroswer.cssSelectorOne(\"div.HotItem-content a p\",element).getText():\"\";\n" +
                        "            String img = defaultBroswer.isExist(\"a.HotItem-img img\",element)?\n" +
                        "                    defaultBroswer.cssSelectorOne(\"a.HotItem-img img\",element).getAttribute(\"src\"):\"\";\n" +
                        "            System.out.println(id);\n" +
                        "            System.out.println(href);\n" +
                        "            System.out.println(title);\n" +
                        "            System.out.println(content);\n" +
                        "            System.out.println(img);\n" +
                        "            Result result = new Result();\n" +
                        "            result.id = id;\n" +
                        "            result.href = href;\n" +
                        "            result.title = title;\n" +
                        "            result.content = content;\n" +
                        "            result.img = img;\n" +
                        "            resultList.add(result);\n" +
                        "        }\n" +
                        "        defaultBroswer.getWebDriver().quit();\n" +
                        "      return resultList;\n" +
                        "    }\n" +
                        "  \n" +
                        "  \n" +
                        "  /**\n" +
                        "  * 数据\n" +
                        "  **/\n" +
                        "  class Data{\n" +
                        "    String url;\n" +
                        "    String name;\n" +
                        "  }\n" +
                        "  \n" +
                        "  /**\n" +
                        "  * 输出格式\n" +
                        "  **/\n" +
                        "  class Result{\n" +
                        "   public String id;\n" +
                        "   public String title;\n" +
                        "   public String href;\n" +
                        "   public String content;\n" +
                        "   public String img;\n" +
                        "  }\n" +
                        "}\n" +
                        "\n" +
                        "\n" +
                        "\n" +
                        "\n" +
                        "\n" +
                        "\n" +
                        "- callin: {seg:'calculate',0: 'hello'};"}
                        style={{ color: 'red' }}
                        readOnly
                        setOptions={{
                            showLineNumbers: false,
                            tabSize: 2,
                        }}
                    />
                </Modal>
            </div>
        );
    }


}

export default ScriptShare;
