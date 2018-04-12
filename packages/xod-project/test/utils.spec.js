import R from 'ramda';
import chai, { expect } from 'chai';
import dirtyChai from 'dirty-chai';
import shortid from 'shortid';

import { PIN_TYPE, PIN_DIRECTION } from '../src/constants';
import * as Utils from '../src/utils';

chai.use(dirtyChai);

describe('Utils', () => {
  // transforming node ids
  describe('renumering of nodeIds', () => {
    const nodes = [
      { id: 'a', was: 'a' },
      { id: 'b', was: 'b' },
      { id: 'c', was: 'c' },
    ];
    const links = [
      { id: 'x', input: { nodeId: 'b' }, output: { nodeId: 'a' } },
      { id: 'y', input: { nodeId: 'c' }, output: { nodeId: 'b' } },
    ];
    const nodesIdMap = Utils.guidToIdx(nodes);

    const expectedNodes = [
      { id: '0', was: 'a' },
      { id: '1', was: 'b' },
      { id: '2', was: 'c' },
    ];
    const expectedLinks = [
      { id: 'x', input: { nodeId: '1' }, output: { nodeId: '0' } },
      { id: 'y', input: { nodeId: '2' }, output: { nodeId: '1' } },
    ];

    it('guidToIdx: should return an empty map for empty nodes', () => {
      expect(Utils.guidToIdx({}))
        .to.be.an('object')
        .and.to.be.empty();
    });
    it('guidToIdx: should return a map oldId to newId', () => {
      expect(Utils.guidToIdx(nodes)).to.be.deep.equal({
        a: '0',
        b: '1',
        c: '2',
      });
    });

    it('resolveNodeIds: should return nodes with new ids', () => {
      expect(Utils.resolveNodeIds(nodesIdMap, nodes)).to.be.deep.equal(
        expectedNodes
      );
    });
    it('resolveLinkNodeIds: should return links with resolved node ids', () => {
      expect(Utils.resolveLinkNodeIds(nodesIdMap, links)).to.be.deep.equal(
        expectedLinks
      );
    });
  });

  describe('matchPatchSignature', () => {
    const fullSignature = {
      [PIN_DIRECTION.INPUT]: {
        0: PIN_TYPE.NUMBER,
        1: PIN_TYPE.STRING,
        2: PIN_TYPE.PULSE,
      },
      [PIN_DIRECTION.OUTPUT]: {
        0: PIN_TYPE.NUMBER,
        1: PIN_TYPE.PULSE,
      },
    };

    it('should detect missing pins', () => {
      const mask = {
        [PIN_DIRECTION.INPUT]: {
          3: PIN_TYPE.PULSE,
        },
      };

      expect(Utils.matchPatchSignature(mask, fullSignature)).to.be.false();
    });
    it('should detect wrong pins', () => {
      const mask = {
        [PIN_DIRECTION.INPUT]: {
          2: PIN_TYPE.PULSE, // this one is ok
        },
        [PIN_DIRECTION.OUTPUT]: {
          1: PIN_TYPE.STRING, // here is the wrong one
        },
      };

      expect(Utils.matchPatchSignature(mask, fullSignature)).to.be.false();
    });
    it('should return true when signature matches the mask', () => {
      const mask = {
        [PIN_DIRECTION.INPUT]: {
          0: PIN_TYPE.NUMBER,
          2: PIN_TYPE.PULSE,
        },
        [PIN_DIRECTION.OUTPUT]: {
          1: PIN_TYPE.PULSE,
        },
      };

      expect(Utils.matchPatchSignature(mask, fullSignature)).to.be.true();
    });
  });

  // etc
  describe('generateId', () => {
    it('should be valid shortid', () => {
      const id = Utils.generateId();
      expect(shortid.isValid(id)).to.be.true();
    });
    it('should return new ids each time', () => {
      const ids = R.uniq(R.times(Utils.generateId, 5));
      expect(ids).to.have.lengthOf(5);
    });
  });
  describe('validateId', () => {
    it('should return false for invalid id', () => {
      const id = 'i have spaces и немного кириллицы';
      expect(shortid.isValid(id)).to.be.false();
    });
    it('should be valid shortid', () => {
      const id = '123aBc';
      expect(shortid.isValid(id)).to.be.true();
    });
  });
});
