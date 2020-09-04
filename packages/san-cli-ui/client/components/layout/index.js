/**
 * @file 带侧边栏布局组件
 * @author zttonly
 */

import Component from '@lib/san-component';
import {openInEditor} from '@lib/utils/open-in-editor';
import ConnectionStatus from '@components/connection-status';
import PROJECTS from '@graphql/project/projects.gql';
import PROJECT_CURRENT from '@graphql/project/projectCurrent.gql';
import PROJECT_OPEN from '@graphql/project/projectOpen.gql';
import {Link} from 'san-router';
import './index.less';

export default class ComponentLayout extends Component {
    static template = /* html */`
            <s-layout class="h1oh layout">
                <c-connection-status />
                <s-layout-header class="header">
                    <r-link to="/">
                        <s-icon type="home" class="home-link" />
                    </r-link>
                    <s-dropdown trigger="click" class="project-name">
                        <s-menu slot="overlay"
                            selectable="{{false}}"
                            on-click="handleMenuClick"
                            style="box-shadow: 0 2px 20px rgba(0, 0, 0 , .1); border-radius: 5px; width: 160px;"
                        >
                            <s-menu-item key="open-in-editor">
                                <s-icon type="codepen"></s-icon>{{$t('dropdown.editor')}}
                            </s-menu-item>
                            <s-menu-divider></s-menu-divider>
                            <s-menu-item-group title="{{$t('dropdown.recentProject')}}">
                                <s-menu-item s-for="project in list" key="{{project.id}}">
                                    <s-icon type="history"></s-icon>{{project.name}}
                                </s-menu-item>
                            </s-menu-item-group>
                        </s-menu>
                        <s-button>{{projectCurrent.name}}<s-icon type="down" /></s-button>
                    </s-dropdown>
                    <span class="line"></span>
                    <h1 class="title">{{title}}</h1>
                    <div class="head-right">
                        <slot name="right"></slot>
                    </div>
                </s-layout-header>

                <s-layout class="h1oh flex-all main-wrap">
                    <s-layout-sider theme="light">
                        <s-menu class="menu" mode="inline" selectedKeys="{{nav}}">
                            <s-menu-item s-for="item in $t('menu')" key="{{item.key}}">
                                <r-link to="{{item.link}}">
                                    <s-icon type="{{item.icon}}"></s-icon>
                                    <span>{{item.text}}</span>
                                </r-link>
                            </s-menu-item>
                        </s-menu>
                    </s-layout-sider>
                    <s-layout-content class="main">
                        <s-spin s-if="pageLoading"
                            class="loading"
                            spinning="{=pageLoading=}"
                            size="large"
                        >
                            <s-icon slot="indicator" type="loading" style="font-size: 30px;" />
                        </s-spin>
                        <slot name="content"></slot>
                    </s-layout-content>
                </s-layout>
            </s-layout>
    `;
    static components = {
        'c-connection-status': ConnectionStatus,
        'r-link': Link
    };
    initData() {
        return {
            list: [],
            projectCurrent: {},
            pageLoading: false
        };
    }
    async inited() {
        this.getRecentProjectList();

        let projectCurrent = await this.$apollo.query({query: PROJECT_CURRENT});
        // 当前打开的project,记录在数据库
        projectCurrent.data && this.data.set('projectCurrent', projectCurrent.data.projectCurrent);
    }
    async getRecentProjectList() {
        const projects = await this.$apollo.query({query: PROJECTS});
        if (projects.data) {
            const projectsDuplicate = projects.data.projects.slice();
            // 之所以不直接对 projects.data.projects 进行 sort，是因为如果这里改了 projects.data.projects，还会影响其它用到了 projects.data.projects 的地方
            projectsDuplicate.sort((project1, project2) => project2.openDate - project1.openDate);
            this.data.set('list', projectsDuplicate.slice(1, 4));
        }
    }
    async handleMenuClick(e) {
        if (e.key === 'open-in-editor') {
            openInEditor(this.data.get('projectCurrent.path'));
            return;
        }

        let res = await this.$apollo.mutate({
            mutation: PROJECT_OPEN,
            variables: {
                id: e.key
            }
        });
        res.data && this.data.set('projectCurrent', res.data.projectOpen);

        this.getRecentProjectList();

        location.reload();
    }
}
