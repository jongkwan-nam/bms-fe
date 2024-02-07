import './testTree.scss';
import FeOrgTree from './tree/FeOrgTree';
import FeRecOrgTree from './tree/FeRecOrgTree';

const feOrgTree = new FeOrgTree();
document.querySelector('body').append(feOrgTree);

const feRecOrgTree = new FeRecOrgTree();
document.querySelector('body').append(feRecOrgTree);
