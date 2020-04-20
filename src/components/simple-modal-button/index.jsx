import React,{Component} from "react"
import { Modal, Button } from 'antd';

class SimpleModalButton extends Component {
    constructor(props) {
        super(props)
        this.state = {
            visible: false,
            confirmLoading: false,
            children: null,
        };
    }


    static getDerivedStateFromProps(props, state) {
        // 保存 prevId 在 state 中，以便我们在 props 变化时进行对比。
        // 清除之前加载的数据（这样我们就不会渲染旧的内容）。
        if (props.children !== state.children) {
            return {
                children: props.children,
            };
        }
        // 无需更新 state
        return null;
    }

    componentDidMount() {
        this.setState({
            children:this.props.children
        })
    }

    showModal = () => {
        this.setState({
            visible: true,
        });
        this.props.showModal();

    };

    handleOk = () => {
        this.props.onOk();
        this.setState({visible:false})
    };

    handleCancel = () => {
        this.props.onCancel()
        this.setState({
            visible: false,
        });
    };

    render() {
        const { visible } = this.state;
        return (
            <span>
                <Button style={{ marginLeft: 8 }}  onClick={this.showModal}>
                    {this.props.value || '编辑'}
                </Button>
                <Modal
                    title={this.props.title || '标题'}
                    visible={visible}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                >
                    {this.state.children}
                </Modal>
            </span>
        );
    }
}

export default SimpleModalButton
